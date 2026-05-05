"use client";

import { useEffect, useState } from "react";

interface RedditUserProfile {
  name: string;
  icon_img: string;
  total_karma: number;
  link_karma: number;
  comment_karma: number;
  awardee_karma: number;
  created_utc: number;
  subreddit?: { subscribers: number };
}

interface ProfileCardProps {
  profile: RedditUserProfile | null | undefined;
  username: string;
}

function formatJoinDate(utc: number): string {
  return new Date(utc * 1000).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function formatAge(utc: number): string {
  const days = Math.floor((Date.now() / 1000 - utc) / 86400);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function fmt(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}k`;
  return String(n);
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0c0c0c]">
      <div className="h-20 bg-gradient-to-br from-[rgba(255,69,0,0.12)] via-[rgba(124,58,237,0.08)] to-transparent" />
      <div className="px-5 pb-6 pt-12">
        <div className="mb-3 h-5 w-20 animate-pulse rounded-full bg-[#141414]" />
        <div className="mb-2 h-6 w-40 animate-pulse rounded-lg bg-[#141414]" />
        <div className="mb-5 h-3.5 w-full animate-pulse rounded bg-[#141414]" />
        <div className="mb-5 grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-xl bg-[#141414]"
            />
          ))}
        </div>
        <div className="mb-5 space-y-2.5">
          <div className="h-4 w-32 animate-pulse rounded bg-[#141414]" />
          <div className="h-4 w-24 animate-pulse rounded bg-[#141414]" />
        </div>
        <div className="h-11 animate-pulse rounded-xl bg-[#141414]" />
      </div>
    </div>
  );
}

export default function ProfileCard({ profile, username }: ProfileCardProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [profile?.icon_img]);

  // Show skeleton while loading (profile is undefined = still fetching)
  if (profile === undefined) return <SkeletonCard />;

  // Profile is null = account not found or API error, show minimal fallback
  if (!profile) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0c0c0c]">
        <div className="h-20 bg-gradient-to-br from-[rgba(255,69,0,0.12)] via-[rgba(124,58,237,0.08)] to-transparent" />
        <div className="px-5 pb-6 pt-12">
          <p className="text-sm font-bold text-white">{username}</p>
          <p className="mt-1 text-xs text-[#808080]">u/{username}</p>
          <a
            href={`https://reddit.com/u/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#272727] bg-[#141414] py-3 text-sm font-semibold text-white transition-colors hover:border-[rgba(255,69,0,0.3)] hover:text-[#ff4500]"
          >
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            View on Reddit
          </a>
        </div>
      </div>
    );
  }

  const isDefaultAvatar =
    imgError ||
    !profile.icon_img ||
    profile.icon_img.includes("www.redditstatic.com/avatars/defaults");

  const joinDate = formatJoinDate(profile.created_utc);
  const age = formatAge(profile.created_utc);
  const followers = profile.subreddit?.subscribers ?? 0;
  const commentKarmaColor = profile.comment_karma < 0 ? "#ff6030" : "#60a5fa";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0c0c0c] shadow-2xl">
      {/* Banner */}
      <div className="relative h-20 bg-gradient-to-br from-[rgba(255,69,0,0.18)] via-[rgba(124,58,237,0.12)] to-[#0c0c0c]">
        {/* Avatar, overlaps banner bottom */}
        <div className="absolute -bottom-8 left-5">
          <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-[#0c0c0c] ring-4 ring-[#0c0c0c]">
            {!isDefaultAvatar ? (
              <img
                src={profile.icon_img}
                alt={profile.name}
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ff4500] to-[#7c3aed]">
                <span className="text-2xl font-black text-white">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-6 pt-12">
        {/* Verified badge */}
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.08)] px-2.5 py-1 text-[11px] font-semibold text-[#22c55e]">
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Verified
        </span>

        {/* Username */}
        <h2 className="mb-1 break-all text-[18px] font-black leading-tight tracking-tight text-white">
          {profile.name}
        </h2>

        {/* Meta line */}
        <p className="mb-5 text-[11px] leading-relaxed text-[#808080]">
          u/{profile.name}&nbsp;&nbsp;·&nbsp;&nbsp;joined {joinDate}
          &nbsp;&nbsp;·&nbsp;&nbsp;{age}
        </p>

        {/* Karma grid, 2×2 */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] p-3">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#424242]">
              Total Karma
            </p>
            <p className="text-[22px] font-black leading-none text-[#ff4500]">
              {fmt(profile.total_karma)}
            </p>
          </div>
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] p-3">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#424242]">
              Post Karma
            </p>
            <p className="text-[22px] font-black leading-none text-white">
              {fmt(profile.link_karma)}
            </p>
          </div>
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] p-3">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#424242]">
              Comment Karma
            </p>
            <p
              className="text-[22px] font-black leading-none"
              style={{ color: commentKarmaColor }}
            >
              {fmt(profile.comment_karma)}
            </p>
          </div>
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] p-3">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#424242]">
              Awards
            </p>
            <p className="text-[22px] font-black leading-none text-[#22c55e]">
              {fmt(profile.awardee_karma)}
            </p>
          </div>
        </div>

        {/* Info rows */}
        <div className="mb-5 space-y-2.5">
          <div className="flex items-center gap-2.5 text-[13px] text-[#808080]">
            <svg
              className="h-4 w-4 flex-shrink-0 text-[#424242]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                ry="2"
                strokeWidth={1.5}
              />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth={1.5} />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth={1.5} />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth={1.5} />
            </svg>
            Joined {joinDate}
          </div>
          <div className="flex items-center gap-2.5 text-[13px] text-[#808080]">
            <svg
              className="h-4 w-4 flex-shrink-0 text-[#424242]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {followers.toLocaleString()} followers
          </div>
        </div>

        {/* View on Reddit CTA */}
        <a
          href={`https://reddit.com/u/${profile.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#272727] bg-[#141414] py-3 text-[13px] font-semibold text-white transition-all hover:border-[rgba(255,69,0,0.35)] hover:bg-[rgba(255,69,0,0.05)] hover:text-[#ff4500]"
        >
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
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          View on Reddit
        </a>
      </div>
    </div>
  );
}
