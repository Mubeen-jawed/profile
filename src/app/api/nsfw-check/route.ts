import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const ARCTIC_SHIFT_BASE = "https://arctic-shift.photon-reddit.com/api";
const FETCH_TIMEOUT_MS = 8000;

interface AboutResult {
  found: boolean;
  isNsfw: boolean;
  postCount: number;
  commentCount: number;
}

async function fetchJson(url: string): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    if (!res.ok) {
      console.warn(`[nsfw-check] ${url} returned ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[nsfw-check] fetch failed for ${url}:`, err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function checkUserViaArcticShift(username: string): Promise<AboutResult | null> {
  const postsUrl =
    `${ARCTIC_SHIFT_BASE}/posts/search?author=${encodeURIComponent(username)}` +
    `&limit=100&fields=over_18,subreddit`;
  const commentsUrl =
    `${ARCTIC_SHIFT_BASE}/comments/search?author=${encodeURIComponent(username)}` +
    `&limit=100&fields=subreddit`;

  const [postsRaw, commentsRaw] = await Promise.all([
    fetchJson(postsUrl),
    fetchJson(commentsUrl),
  ]);

  if (postsRaw === null && commentsRaw === null) return null;

  const posts =
    (postsRaw as { data?: Array<{ over_18?: boolean; subreddit?: string }> } | null)?.data ?? [];
  const comments =
    (commentsRaw as { data?: Array<{ subreddit?: string }> } | null)?.data ?? [];

  const postCount = posts.length;
  const commentCount = comments.length;

  if (postCount === 0 && commentCount === 0) {
    return { found: false, isNsfw: false, postCount: 0, commentCount: 0 };
  }

  const hasNsfwPost = posts.some((p) => p.over_18 === true);

  return {
    found: true,
    isNsfw: hasNsfwPost,
    postCount,
    commentCount,
  };
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
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return sid;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const { allowed } = rateLimit(`nsfw:${ip}`, 30, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many checks. Please slow down and try again shortly." },
      { status: 429 }
    );
  }

  if (!username || username.trim().length === 0) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
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

  const session = await getSession();
  const userId = session?.userId ?? null;
  const sessionId = await getOrCreateSessionId();

  try {
    const result = await checkUserViaArcticShift(sanitized);

    if (!result) {
      return NextResponse.json(
        { error: "Couldn't reach the search service right now. Try again in a moment." },
        { status: 502 }
      );
    }

    await prisma.nsfwCheck.create({
      data: {
        userId,
        sessionId,
        checkedUsername: sanitized,
        isNsfw: result.isNsfw,
        found: result.found,
      },
    });

    return NextResponse.json({
      username: sanitized,
      found: result.found,
      isNsfw: result.isNsfw,
      postCount: result.postCount,
      commentCount: result.commentCount,
    });
  } catch (err) {
    console.error("[nsfw-check] Failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to check profile. Please try again." },
      { status: 500 }
    );
  }
}
