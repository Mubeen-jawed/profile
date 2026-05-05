export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  score: number;
  num_comments: number;
  url: string;
  permalink: string;
  created_utc: number;
  thumbnail: string;
  is_self: boolean;
  link_flair_text: string | null;
  post_hint?: string;
  preview?: {
    images: Array<{
      source: { url: string; width: number; height: number };
    }>;
  };
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  score: number;
  created_utc: number;
  permalink: string;
  link_title: string;
  link_permalink: string;
}

export interface RedditUserProfile {
  name: string;
  icon_img: string;
  total_karma: number;
  link_karma: number;
  comment_karma: number;
  awardee_karma: number;
  awarder_karma: number;
  created_utc: number;
  subreddit?: { subscribers: number };
  is_gold: boolean;
  verified: boolean;
}

const REDDIT_USER_AGENT = "redditprofile/1.0";
const ARCTIC_SHIFT_BASE = "https://arctic-shift.photon-reddit.com/api";

// Small delay to avoid Reddit rate limits when making many requests
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper to map raw Reddit post data to RedditPost
function mapPost(post: Record<string, unknown>): RedditPost {
  return {
    id: post.id as string,
    title: (post.title as string) || "",
    selftext: (post.selftext as string) || "",
    author: post.author as string,
    subreddit: post.subreddit as string,
    subreddit_name_prefixed:
      (post.subreddit_name_prefixed as string) || `r/${post.subreddit}`,
    score: (post.score as number) || 0,
    num_comments: (post.num_comments as number) || 0,
    url: (post.url as string) || "",
    permalink: (post.permalink as string)?.startsWith("http")
      ? (post.permalink as string)
      : `https://reddit.com${post.permalink as string}`,
    created_utc: (post.created_utc as number) || (post.created as number) || 0,
    thumbnail: (post.thumbnail as string) || "",
    is_self: (post.is_self as boolean) || false,
    link_flair_text: (post.link_flair_text as string | null) || null,
    post_hint: post.post_hint as string | undefined,
    preview: post.preview as RedditPost["preview"],
  };
}

// Helper to map raw Reddit comment data to RedditComment
function mapComment(c: Record<string, unknown>): RedditComment {
  return {
    id: c.id as string,
    body: (c.body as string) || "",
    author: c.author as string,
    subreddit: c.subreddit as string,
    subreddit_name_prefixed:
      (c.subreddit_name_prefixed as string) || `r/${c.subreddit}`,
    score: (c.score as number) || 0,
    created_utc: (c.created_utc as number) || (c.created as number) || 0,
    permalink: (c.permalink as string)?.startsWith("http")
      ? (c.permalink as string)
      : `https://reddit.com${c.permalink as string}`,
    link_title: (c.link_title as string) || "",
    link_permalink: c.link_permalink
      ? (c.link_permalink as string).startsWith("http")
        ? (c.link_permalink as string)
        : `https://reddit.com${c.link_permalink as string}`
      : "",
  };
}

/**
 * Fetch a Reddit user's profile data (karma, avatar, join date, followers)
 */
export async function fetchRedditUserProfile(
  username: string,
): Promise<RedditUserProfile | null> {
  try {
    const res = await fetch(
      `https://www.reddit.com/user/${encodeURIComponent(username)}/about.json?raw_json=1`,
      { headers: { "User-Agent": REDDIT_USER_AGENT }, next: { revalidate: 0 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.data) return null;
    return data.data as RedditUserProfile;
  } catch {
    return null;
  }
}

/**
 * Fetch a Reddit post's data via the JSON API
 */
export async function fetchRedditPost(
  postUrl: string,
): Promise<RedditPost | null> {
  try {
    const cleanUrl = postUrl.replace(/\/$/, "");
    const jsonUrl = `${cleanUrl}.json`;

    const res = await fetch(jsonUrl, {
      headers: { "User-Agent": REDDIT_USER_AGENT },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data?.[0]?.data?.children?.[0]?.data) return null;

    return mapPost(data[0].data.children[0].data as Record<string, unknown>);
  } catch {
    return null;
  }
}

/**
 * Fetch user's posts from Reddit API with a specific sort + time filter
 */
async function fetchUserPostsWithSort(
  username: string,
  sort: string,
  t?: string,
): Promise<RedditPost[]> {
  const all: RedditPost[] = [];
  let after: string | null = null;
  const perPage = 100;

  while (true) {
    try {
      let url = `https://www.reddit.com/user/${encodeURIComponent(username)}/submitted.json?sort=${sort}&limit=${perPage}&raw_json=1`;
      if (t) url += `&t=${t}`;
      if (after) url += `&after=${after}`;

      const res = await fetch(url, {
        headers: { "User-Agent": REDDIT_USER_AGENT },
      });
      if (!res.ok) break;

      const data = await res.json();
      if (!data?.data?.children || data.data.children.length === 0) break;

      const posts = data.data.children.map(
        (child: { data: Record<string, unknown> }) => mapPost(child.data),
      );
      all.push(...posts);
      after = data.data.after;
      if (!after) break;
      await delay(300);
    } catch {
      break;
    }
  }
  return all;
}

/**
 * Fetch user's comments from Reddit API with a specific sort + time filter
 */
async function fetchUserCommentsWithSort(
  username: string,
  sort: string,
  t?: string,
): Promise<RedditComment[]> {
  const all: RedditComment[] = [];
  let after: string | null = null;
  const perPage = 100;

  while (true) {
    try {
      let url = `https://www.reddit.com/user/${encodeURIComponent(username)}/comments.json?sort=${sort}&limit=${perPage}&raw_json=1`;
      if (t) url += `&t=${t}`;
      if (after) url += `&after=${after}`;

      const res = await fetch(url, {
        headers: { "User-Agent": REDDIT_USER_AGENT },
      });
      if (!res.ok) break;

      const data = await res.json();
      if (!data?.data?.children || data.data.children.length === 0) break;

      const comments = data.data.children.map(
        (child: { data: Record<string, unknown> }) => mapComment(child.data),
      );
      all.push(...comments);
      after = data.data.after;
      if (!after) break;
      await delay(300);
    } catch {
      break;
    }
  }
  return all;
}

/**
 * Fetch user's posts directly from Reddit's user API (sort=new, paginated)
 */
export async function fetchRedditUserPosts(
  username: string,
  limit = 1000,
): Promise<RedditPost[]> {
  const all: RedditPost[] = [];
  let after: string | null = null;

  while (all.length < limit) {
    try {
      let url = `https://www.reddit.com/user/${encodeURIComponent(username)}/submitted.json?sort=new&limit=100&raw_json=1`;
      if (after) url += `&after=${after}`;

      const res = await fetch(url, {
        headers: { "User-Agent": REDDIT_USER_AGENT },
      });
      if (!res.ok) break;

      const data = await res.json();
      if (!data?.data?.children || data.data.children.length === 0) break;

      data.data.children.forEach((child: { data: Record<string, unknown> }) =>
        all.push(mapPost(child.data)),
      );
      after = data.data.after;
      if (!after) break;
      await delay(200);
    } catch {
      break;
    }
  }
  return all;
}

/**
 * Fetch user's comments from Reddit API (sort=new, paginated)
 */
export async function fetchRedditUserComments(
  username: string,
  limit = 1000,
): Promise<RedditComment[]> {
  const all: RedditComment[] = [];
  let after: string | null = null;

  while (all.length < limit) {
    try {
      let url = `https://www.reddit.com/user/${encodeURIComponent(username)}/comments.json?sort=new&limit=100&raw_json=1`;
      if (after) url += `&after=${after}`;

      const res = await fetch(url, {
        headers: { "User-Agent": REDDIT_USER_AGENT },
      });
      if (!res.ok) break;

      const data = await res.json();
      if (!data?.data?.children || data.data.children.length === 0) break;

      data.data.children.forEach((child: { data: Record<string, unknown> }) =>
        all.push(mapComment(child.data)),
      );
      after = data.data.after;
      if (!after) break;
      await delay(200);
    } catch {
      break;
    }
  }
  return all;
}

/**
 * Fetch user's posts across ALL sort orders to maximise coverage
 * Tries: new, top/all, top/year, top/month, controversial/all, hot
 */
export async function deepFetchUserPosts(
  username: string,
): Promise<RedditPost[]> {
  const sortVariants = [
    { sort: "new" },
    { sort: "top", t: "all" },
    { sort: "top", t: "year" },
    { sort: "top", t: "month" },
    { sort: "controversial", t: "all" },
    { sort: "hot" },
  ];

  const results = await Promise.allSettled(
    sortVariants.map(({ sort, t }) =>
      fetchUserPostsWithSort(username, sort, t),
    ),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<RedditPost[]> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value);
}

/**
 * Fetch user's comments across ALL sort orders to maximise coverage
 */
export async function deepFetchUserComments(
  username: string,
): Promise<RedditComment[]> {
  const sortVariants = [
    { sort: "new" },
    { sort: "top", t: "all" },
    { sort: "top", t: "year" },
    { sort: "controversial", t: "all" },
    { sort: "hot" },
  ];

  const results = await Promise.allSettled(
    sortVariants.map(({ sort, t }) =>
      fetchUserCommentsWithSort(username, sort, t),
    ),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<RedditComment[]> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value);
}

/**
 * Fetch user's full activity (posts + comments) from the overview endpoint
 */
export async function fetchRedditUserOverview(
  username: string,
  limit = 1000,
): Promise<{ posts: RedditPost[]; comments: RedditComment[] }> {
  const posts: RedditPost[] = [];
  const comments: RedditComment[] = [];
  let after: string | null = null;
  let total = 0;

  while (total < limit) {
    try {
      let url = `https://www.reddit.com/user/${encodeURIComponent(username)}/overview.json?sort=new&limit=100&raw_json=1`;
      if (after) url += `&after=${after}`;

      const res = await fetch(url, {
        headers: { "User-Agent": REDDIT_USER_AGENT },
      });
      if (!res.ok) break;

      const data = await res.json();
      if (!data?.data?.children || data.data.children.length === 0) break;

      for (const child of data.data.children) {
        const d = child.data as Record<string, unknown>;
        if (child.kind === "t3") posts.push(mapPost(d));
        else if (child.kind === "t1") comments.push(mapComment(d));
      }

      total += data.data.children.length;
      after = data.data.after;
      if (!after) break;
      await delay(200);
    } catch {
      break;
    }
  }

  return { posts, comments };
}

/**
 * Search Reddit (author:username) with a specific sort
 */
async function searchRedditWithSort(
  username: string,
  sort: string,
  t?: string,
): Promise<RedditPost[]> {
  const all: RedditPost[] = [];
  let after: string | null = null;

  while (all.length < 300) {
    try {
      let url = `https://www.reddit.com/search.json?q=author:${encodeURIComponent(username)}&sort=${sort}&limit=100&raw_json=1`;
      if (t) url += `&t=${t}`;
      if (after) url += `&after=${after}`;

      const res = await fetch(url, {
        headers: { "User-Agent": REDDIT_USER_AGENT },
      });
      if (!res.ok) break;

      const data = await res.json();
      if (!data?.data?.children) break;

      const posts = data.data.children
        .filter((child: { kind: string }) => child.kind === "t3")
        .map((child: { data: Record<string, unknown> }) => mapPost(child.data));

      if (posts.length === 0) break;
      all.push(...posts);
      after = data.data.after;
      if (!after) break;
      await delay(300);
    } catch {
      break;
    }
  }
  return all;
}

/**
 * Search Reddit for posts by the username (primary: sort=new, paginated)
 */
export async function searchRedditForUser(
  username: string,
  limit = 250,
): Promise<RedditPost[]> {
  return searchRedditWithSort(username, "new");
}

/**
 * Deep Reddit search: runs author: search across multiple sort orders
 */
export async function deepSearchReddit(
  username: string,
): Promise<RedditPost[]> {
  const results = await Promise.allSettled([
    searchRedditWithSort(username, "new"),
    searchRedditWithSort(username, "top", "all"),
    searchRedditWithSort(username, "top", "year"),
    searchRedditWithSort(username, "relevance"),
  ]);

  return results
    .filter(
      (r): r is PromiseFulfilledResult<RedditPost[]> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value);
}

/**
 * Fetch all posts for a user from Arctic Shift (public Reddit archive)
 * Catches data that may be missing from live Reddit API
 */
export async function fetchArcticShiftPosts(
  username: string,
): Promise<RedditPost[]> {
  const all: RedditPost[] = [];
  let before: number | null = null;

  while (true) {
    try {
      let url = `${ARCTIC_SHIFT_BASE}/posts/search?author=${encodeURIComponent(username)}&limit=100`;
      if (before) url += `&before=${before}`;

      const res = await fetch(url, {
        headers: { "User-Agent": REDDIT_USER_AGENT },
        next: { revalidate: 0 },
      });
      if (!res.ok) break;

      const data = await res.json();
      const items: Record<string, unknown>[] = data?.data ?? [];
      if (items.length === 0) break;

      all.push(...items.map(mapPost));
      const last = items[items.length - 1];
      const lastTs = (last.created_utc as number) || (last.created as number);
      if (!lastTs || items.length < 100) break;
      before = lastTs;
      await delay(300);
    } catch {
      break;
    }
  }
  return all;
}

/**
 * Fetch all comments for a user from Arctic Shift (public Reddit archive)
 */
export async function fetchArcticShiftComments(
  username: string,
): Promise<RedditComment[]> {
  const all: RedditComment[] = [];
  let before: number | null = null;

  while (true) {
    try {
      let url = `${ARCTIC_SHIFT_BASE}/comments/search?author=${encodeURIComponent(username)}&limit=100`;
      if (before) url += `&before=${before}`;

      const res = await fetch(url, {
        headers: { "User-Agent": REDDIT_USER_AGENT },
        next: { revalidate: 0 },
      });
      if (!res.ok) break;

      const data = await res.json();
      const items: Record<string, unknown>[] = data?.data ?? [];
      if (items.length === 0) break;

      all.push(...items.map(mapComment));
      const last = items[items.length - 1];
      const lastTs = (last.created_utc as number) || (last.created as number);
      if (!lastTs || items.length < 100) break;
      before = lastTs;
      await delay(300);
    } catch {
      break;
    }
  }
  return all;
}

/**
 * Get a set of subreddits the user is active in (from known posts/comments)
 * Returns up to 20 most frequent subreddits
 */
export function getActiveSubreddits(
  posts: RedditPost[],
  comments: RedditComment[],
  maxSubs = 20,
): string[] {
  const freq: Record<string, number> = {};
  for (const p of posts) freq[p.subreddit] = (freq[p.subreddit] || 0) + 1;
  for (const c of comments) freq[c.subreddit] = (freq[c.subreddit] || 0) + 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxSubs)
    .map(([sub]) => sub);
}

/**
 * Search a specific subreddit for posts by the user
 */
async function searchInSubreddit(
  username: string,
  subreddit: string,
): Promise<RedditPost[]> {
  const all: RedditPost[] = [];
  let after: string | null = null;

  while (all.length < 200) {
    try {
      let url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=author:${encodeURIComponent(username)}&restrict_sr=1&sort=new&limit=100&raw_json=1`;
      if (after) url += `&after=${after}`;

      const res = await fetch(url, {
        headers: { "User-Agent": REDDIT_USER_AGENT },
      });
      if (!res.ok) break;

      const data = await res.json();
      if (!data?.data?.children) break;

      const posts = data.data.children
        .filter((child: { kind: string }) => child.kind === "t3")
        .map((child: { data: Record<string, unknown> }) => mapPost(child.data));

      if (posts.length === 0) break;
      all.push(...posts);
      after = data.data.after;
      if (!after) break;
      await delay(300);
    } catch {
      break;
    }
  }
  return all;
}

/**
 * Deep subreddit scan: searches user's most active subreddits individually
 */
export async function deepSubredditScan(
  username: string,
  subreddits: string[],
): Promise<RedditPost[]> {
  // Do up to 10 subreddits in parallel batches of 5
  const batch = subreddits.slice(0, 10);
  const results = await Promise.allSettled(
    batch.map((sub) => searchInSubreddit(username, sub)),
  );
  return results
    .filter(
      (r): r is PromiseFulfilledResult<RedditPost[]> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value);
}

/**
 * Search Brave Search API for Reddit posts by a username (max 10 pages = 100 results)
 */
export async function searchBraveForRedditUser(
  username: string,
  pages = 10,
): Promise<string[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;

  if (!apiKey) return [];

  const allUrls: string[] = [];
  const query = encodeURIComponent(`site:reddit.com ${username}`);
  const maxPages = Math.min(pages, 10);

  for (let page = 0; page < maxPages; page++) {
    const offset = page * 10;
    const url = `https://api.search.brave.com/res/v1/web/search?q=${query}&count=10&offset=${offset}`;

    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": apiKey,
        },
      });
      if (!res.ok) break;

      const data = await res.json();
      const hits: string[] = (data.web?.results ?? [])
        .map((r: { url: string }) => r.url)
        .filter(
          (link: string) =>
            link.includes("reddit.com/r/") && link.includes("/comments/"),
        );

      allUrls.push(...hits);
      if (hits.length < 10) break;
    } catch {
      break;
    }
  }
  return [...new Set(allUrls)];
}

/**
 * Extract comments by a specific user from a Reddit post thread
 */
export async function extractCommentsFromPost(
  postUrl: string,
  username: string,
): Promise<RedditComment[]> {
  try {
    const cleanUrl = postUrl.replace(/\/$/, "");
    const jsonUrl = `${cleanUrl}.json?limit=500&raw_json=1`;

    const res = await fetch(jsonUrl, {
      headers: { "User-Agent": REDDIT_USER_AGENT },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data?.[1]?.data?.children) return [];

    const userComments: RedditComment[] = [];
    const lowerUsername = username.toLowerCase();
    const postTitle: string = data?.[0]?.data?.children?.[0]?.data?.title || "";
    const postPermalink: string = data?.[0]?.data?.children?.[0]?.data
      ?.permalink
      ? `https://reddit.com${data[0].data.children[0].data.permalink}`
      : postUrl;

    function findComments(
      children: Array<{ kind: string; data: Record<string, unknown> }>,
    ) {
      for (const child of children) {
        if (child.kind !== "t1") continue;
        const c = child.data;
        if ((c.author as string)?.toLowerCase() === lowerUsername) {
          userComments.push({
            id: c.id as string,
            body: (c.body as string) || "",
            author: c.author as string,
            subreddit: c.subreddit as string,
            subreddit_name_prefixed:
              (c.subreddit_name_prefixed as string) || `r/${c.subreddit}`,
            score: (c.score as number) || 0,
            created_utc: (c.created_utc as number) || 0,
            permalink: (c.permalink as string)?.startsWith("http")
              ? (c.permalink as string)
              : `https://reddit.com${c.permalink as string}`,
            link_title: (c.link_title as string) || postTitle,
            link_permalink: c.link_permalink
              ? (c.link_permalink as string).startsWith("http")
                ? (c.link_permalink as string)
                : `https://reddit.com${c.link_permalink as string}`
              : postPermalink,
          });
        }
        if (c.replies && typeof c.replies === "object") {
          const replies = c.replies as {
            data?: {
              children?: Array<{ kind: string; data: Record<string, unknown> }>;
            };
          };
          if (replies.data?.children) findComments(replies.data.children);
        }
      }
    }

    findComments(data[1].data.children);
    return userComments;
  } catch {
    return [];
  }
}
