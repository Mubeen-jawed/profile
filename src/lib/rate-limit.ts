const MAX_ENTRIES = 10000;
const hits = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of hits) {
    if (now > val.resetAt) hits.delete(key);
  }
}, 60_000);

function evictIfNeeded() {
  if (hits.size <= MAX_ENTRIES) return;
  // Evict oldest entries (earliest resetAt) until under limit
  const entries = [...hits.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
  const toRemove = entries.slice(0, hits.size - MAX_ENTRIES + 1000);
  for (const [key] of toRemove) {
    hits.delete(key);
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    evictIfNeeded();
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count++;
  const allowed = entry.count <= limit;
  return { allowed, remaining: Math.max(0, limit - entry.count) };
}
