import { RedditComment } from "@/lib/reddit";

function timeAgo(utcSeconds: number): string {
  const now = Date.now() / 1000;
  const diff = now - utcSeconds;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

function formatScore(score: number): string {
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return score.toString();
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export default function RedditCommentCard({
  comment,
}: {
  comment: RedditComment;
}) {
  return (
    <a
      href={comment.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group block animate-fade-in"
    >
      <article className="rounded-xl border border-card-border bg-card-bg p-4 transition-all duration-200 hover:border-green-accent/30 hover:bg-[#141414] hover:shadow-[0_0_30px_rgba(255,69,0,0.05)] sm:p-5">
        {/* Header: subreddit + time */}
        <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
          <span className="rounded-md bg-green-accent/10 px-2 py-0.5 font-medium text-green-accent">
            {comment.subreddit_name_prefixed}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500">u/{comment.author}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500">
            {timeAgo(comment.created_utc)}
          </span>
        </div>

        {/* Post title this comment is on */}
        {comment.link_title && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-card-border bg-background px-3 py-2">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-xs text-zinc-400 sm:text-sm">
              on: <span className="text-zinc-300">{comment.link_title}</span>
            </span>
          </div>
        )}

        {/* Comment body */}
        <p className="mb-4 text-sm leading-relaxed text-zinc-300 whitespace-pre-line">
          {truncateText(comment.body, 500)}
        </p>

        {/* Footer: score */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 sm:text-sm">
          <div className="flex items-center gap-1.5">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            <span
              className={
                comment.score > 0 ? "text-green-accent" : "text-zinc-500"
              }
            >
              {formatScore(comment.score)}
            </span>
          </div>
          <div className="ml-0 flex items-center gap-1 text-zinc-600 transition-colors group-hover:text-green-accent sm:ml-auto">
            <span className="hidden text-xs sm:inline">View on Reddit</span>
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
        </div>
      </article>
    </a>
  );
}
