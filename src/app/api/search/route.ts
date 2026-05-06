import { NextRequest, NextResponse } from "next/server";
import {
  searchBraveForRedditUser,
  fetchRedditPost,
  fetchRedditUserPosts,
  fetchRedditUserComments,
  fetchRedditUserOverview,
  deepSearchReddit,
  fetchArcticShiftPosts,
  fetchArcticShiftComments,
  extractCommentsFromPost,
  fetchRedditUserProfile,
  RedditPost,
  RedditComment,
  RedditUserProfile,
} from "@/lib/reddit";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { isBlockedUsername } from "@/lib/blocked-usernames";

function dedup<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sid = cookieStore.get("ttp_anon_sid")?.value;
  if (!sid) {
    sid = crypto.randomUUID();
    cookieStore.set("ttp_anon_sid", sid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  return sid;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  // Rate limit: 30 searches per 15 min per IP
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const { allowed } = rateLimit(`search:${ip}`, 30, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many searches. Please slow down and try again shortly." },
      { status: 429 },
    );
  }

  if (!username || username.trim().length === 0) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 },
    );
  }

  const sanitized = username
    .trim()
    .replace(/^https?:\/\/(www\.|old\.|new\.)?reddit\.com\//i, "")
    .replace(/^\/?(u|user)\//i, "")
    .replace(/\/+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "");
  if (sanitized.length === 0 || sanitized.length > 50) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  // ── BLOCKLIST ─────────────────────────────────────────────────────────────
  // Short-circuit before credit logic so blocked lookups don't burn credits.
  if (isBlockedUsername(sanitized)) {
    return NextResponse.json(
      { error: "bad bad, dont search for admin good human", blocked: true },
      { status: 403 },
    );
  }

  // ── AUTH & CREDITS ────────────────────────────────────────────────────────
  const session = await getSession();
  let userId: string | null = null;
  let creditsRemaining = 0;
  let canSeeAll = false;

  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    userId = user.id;
    const userIsPaid = user.isPaid || user.role === "admin";
    canSeeAll = userIsPaid;

    if (userIsPaid) {
      creditsRemaining = -1; // unlimited
    } else {
      if (user.searchCredits <= 0) {
        return NextResponse.json(
          {
            error:
              "No search credits remaining. Upgrade to paid for unlimited searches.",
            creditsRemaining: 0,
          },
          { status: 403 },
        );
      }
      creditsRemaining = user.searchCredits - 1;
      await prisma.user.update({
        where: { id: user.id },
        data: { searchCredits: { decrement: 1 } },
      });
    }
  } else {
    // Anonymous user, track by session cookie
    const sessionId = await getOrCreateSessionId();
    const anonRecord = await prisma.anonCredit.findUnique({
      where: { sessionId },
    });
    const used = anonRecord?.creditsUsed ?? 0;
    const ANON_LIMIT = 1;
    if (used >= ANON_LIMIT) {
      return NextResponse.json(
        {
          error: "Free search used up. Sign up for 10 free credits!",
          creditsRemaining: 0,
        },
        { status: 403 },
      );
    }
    if (anonRecord) {
      await prisma.anonCredit.update({
        where: { sessionId },
        data: { creditsUsed: { increment: 1 } },
      });
    } else {
      await prisma.anonCredit.create({
        data: { sessionId, creditsUsed: 1 },
      });
    }
    creditsRemaining = ANON_LIMIT - used - 1;
  }

  try {
    // ── CHECK CACHE ─────────────────────────────────────────────────────────
    const cached = await prisma.searchCache.findUnique({
      where: { searchedUsername: sanitized.toLowerCase() },
    });

    let posts: RedditPost[];
    let comments: RedditComment[];
    let fromCache = false;
    let userProfile: RedditUserProfile | null = null;

    if (cached && Date.now() - cached.updatedAt.getTime() < CACHE_TTL_MS) {
      // Cache hit, return cached results
      posts = JSON.parse(cached.postsJson);
      comments = JSON.parse(cached.commentsJson);
      fromCache = true;
      userProfile = await fetchRedditUserProfile(sanitized);
    } else {
      // ── DEEP SEARCH ───────────────────────────────────────────────────────
      const [
        googleUrls,
        arcticPosts,
        arcticComments,
        redditPosts,
        redditComments,
        overview,
        searchPosts,
        profileData,
      ] = await Promise.all([
        searchBraveForRedditUser(sanitized, 5),
        fetchArcticShiftPosts(sanitized),
        fetchArcticShiftComments(sanitized),
        fetchRedditUserPosts(sanitized),
        fetchRedditUserComments(sanitized),
        fetchRedditUserOverview(sanitized),
        deepSearchReddit(sanitized),
        fetchRedditUserProfile(sanitized),
      ]);
      userProfile = profileData;

      posts = [];
      comments = [];

      posts.push(
        ...arcticPosts,
        ...redditPosts,
        ...overview.posts,
        ...searchPosts,
      );
      comments.push(...arcticComments, ...redditComments, ...overview.comments);

      // Brave Search posts + thread comment extraction
      if (googleUrls.length > 0) {
        const batch = googleUrls.slice(0, 20);
        const results = await Promise.allSettled(
          batch.map(async (url) => {
            const [post, threadComments] = await Promise.all([
              fetchRedditPost(url),
              extractCommentsFromPost(url, sanitized),
            ]);
            return { post, threadComments };
          }),
        );
        for (const r of results) {
          if (r.status === "fulfilled") {
            if (r.value.post) posts.push(r.value.post);
            comments.push(...r.value.threadComments);
          }
        }
      }

      // Final dedup + sort by newest first
      posts = dedup(posts).sort((a, b) => b.created_utc - a.created_utc);
      comments = dedup(comments).sort((a, b) => b.created_utc - a.created_utc);

      // ── UPDATE CACHE ──────────────────────────────────────────────────────
      const cacheKey = sanitized.toLowerCase();
      await prisma.searchCache.upsert({
        where: { searchedUsername: cacheKey },
        update: {
          postsJson: JSON.stringify(posts),
          commentsJson: JSON.stringify(comments),
          postCount: posts.length,
          commentCount: comments.length,
        },
        create: {
          searchedUsername: cacheKey,
          postsJson: JSON.stringify(posts),
          commentsJson: JSON.stringify(comments),
          postCount: posts.length,
          commentCount: comments.length,
        },
      });
    }

    // Log the search
    const sessionId = await getOrCreateSessionId();
    await prisma.searchLog.create({
      data: {
        userId,
        sessionId,
        searchedUsername: sanitized,
        postCount: posts.length,
        commentCount: comments.length,
      },
    });

    // Enforce paywall server-side, free users only get preview items
    const FREE_PREVIEW_LIMIT = 10;
    const visiblePosts = canSeeAll ? posts : posts.slice(0, FREE_PREVIEW_LIMIT);
    const visibleComments = canSeeAll
      ? comments
      : comments.slice(0, FREE_PREVIEW_LIMIT);

    return NextResponse.json({
      username: sanitized,
      postCount: posts.length,
      commentCount: comments.length,
      posts: visiblePosts,
      comments: visibleComments,
      creditsRemaining,
      canSeeAll,
      fromCache,
      profile: userProfile,
    });
  } catch (err) {
    console.error("[search] Failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to fetch data. Please try again." },
      { status: 500 },
    );
  }
}
