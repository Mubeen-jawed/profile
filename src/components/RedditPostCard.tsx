"use client";

import { useState } from "react";
import { RedditPost } from "@/lib/reddit";

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

const BODY_LIMIT = 300;

export default function RedditPostCard({ post }: { post: RedditPost }) {
  const [expanded, setExpanded] = useState(false);
  const hasLongBody = post.selftext && post.selftext.length > BODY_LIMIT;

  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group block animate-fade-in"
    >
      <article className="rounded-xl border border-card-border bg-card-bg p-4 transition-all duration-200 hover:border-green-accent/30 hover:bg-[#141414] hover:shadow-[0_0_30px_rgba(255,69,0,0.05)] sm:p-5">
        {/* Header: subreddit + time */}
        <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
          <span className="rounded-md bg-green-accent/10 px-2 py-0.5 font-medium text-green-accent">
            {post.subreddit_name_prefixed}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500">u/{post.author}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500">{timeAgo(post.created_utc)}</span>
          {post.link_flair_text && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="max-w-full rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
                {post.link_flair_text}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-base font-semibold text-foreground transition-colors group-hover:text-green-accent sm:text-lg">
          {post.title}
        </h3>

        {/* Content preview with expand/collapse */}
        {post.selftext && (
          <div className="mb-4">
            <p className="text-sm leading-relaxed text-zinc-400">
              {expanded ? post.selftext : truncateText(post.selftext, BODY_LIMIT)}
            </p>
            {hasLongBody && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }}
                className="mt-1.5 text-xs font-medium text-green-accent/70 hover:text-green-accent transition-colors"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}

        {/* External link indicator */}
        {!post.is_self && post.url && !post.url.includes("reddit.com") && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-card-border bg-background px-3 py-2 text-xs sm:text-sm">
            <svg
              className="h-4 w-4 flex-shrink-0 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span className="truncate text-zinc-400">
              {truncateText(post.url, 60)}
            </span>
          </div>
        )}

        {/* Footer: score + comments */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 sm:text-sm">
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className={post.score > 0 ? "text-green-accent" : "text-zinc-500"}>
              {formatScore(post.score)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{post.num_comments} comments</span>
          </div>
          <div className="ml-0 flex items-center gap-1 text-zinc-600 transition-colors group-hover:text-green-accent sm:ml-auto">
            <span className="hidden text-xs sm:inline">View on Reddit</span>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
