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
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
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
    <div className="rounded-2xl border border-[#141414] bg-[#080808]">
      <div className="flex flex-col items-center px-6 pt-7 pb-5">
        <div className="mb-4 h-[60px] w-[60px] animate-pulse rounded-full bg-[#141414]" />
        <div className="mb-1.5 h-4 w-24 animate-pulse rounded-md bg-[#141414]" />
        <div className="h-3 w-16 animate-pulse rounded bg-[#141414]" />
      </div>
      <div className="h-px bg-[#101010]" />
      <div className="grid grid-cols-3 divide-x divide-[#101010]">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center py-4 gap-1.5">
            <div className="h-5 w-10 animate-pulse rounded bg-[#141414]" />
            <div className="h-2 w-8 animate-pulse rounded bg-[#141414]" />
          </div>
        ))}
      </div>
      <div className="h-px bg-[#101010]" />
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="h-3 w-20 animate-pulse rounded bg-[#141414]" />
        <div className="h-3 w-16 animate-pulse rounded bg-[#141414]" />
      </div>
      <div className="px-5 pb-5">
        <div className="h-9 animate-pulse rounded-lg bg-[#141414]" />
      </div>
    </div>
  );
}

export default function ProfileCard({ profile, username }: ProfileCardProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [profile?.icon_img]);

  if (profile === undefined) return <SkeletonCard />;

  if (!profile) {
    return (
      <div className="rounded-2xl border border-[#141414] bg-[#080808]">
        <div className="flex flex-col items-center px-6 pt-7 pb-5">
          <div className="mb-3 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#111] ring-1 ring-white/[0.03]">
            <svg
              className="h-6 w-6 text-[#2a2a2a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <p className="text-[14px] font-bold text-white">{username}</p>
          <p className="font-mono text-[11px] text-[#2e2e2e]">u/{username}</p>
        </div>
        <div className="px-5 pb-5">
          <a
            href={`https://reddit.com/u/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#181818] py-2.5 text-[11px] font-semibold text-[#383838] transition-all hover:border-[#272727] hover:text-[#606060]"
          >
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

  return (
    <div className="overflow-hidden rounded-2xl border border-[#141414] bg-[#080808]">
      {/* Identity */}
      <div className="flex flex-col items-center px-6 pt-7 pb-5">
        <div className="relative mb-4">
          <div className="h-[60px] w-[60px] overflow-hidden rounded-full ring-1 ring-white/[0.06]">
            {!isDefaultAvatar ? (
              <img
                src={profile.icon_img}
                alt={profile.name}
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#111]">
                <span className="text-xl font-black text-[#444]">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {/* Account age chip */}
          <span className="absolute -bottom-1 -right-1 rounded-full border border-[#1e1e1e] bg-[#0d0d0d] px-1.5 py-0.5 font-mono text-[9px] font-bold leading-none text-[#3a3a3a]">
            {age}
          </span>
        </div>

        <h2 className="mb-0.5 break-all text-center text-[15px] font-bold leading-tight tracking-tight text-white">
          {profile.name}
        </h2>
        <p className="font-mono text-[11px] text-[#2e2e2e]">u/{profile.name}</p>
      </div>

      <div className="h-px bg-[#101010]" />

      {/* Stats — 3 column strip */}
      <div className="grid grid-cols-3 divide-x divide-[#101010]">
        <div className="flex flex-col items-center py-4">
          <p className="mb-1 text-[17px] font-black leading-none text-[#ff4500]">
            {fmt(profile.total_karma)}
          </p>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-[#2a2a2a]">
            Karma
          </p>
        </div>
        <div className="flex flex-col items-center py-4">
          <p className="mb-1 text-[17px] font-black leading-none text-white">
            {fmt(profile.link_karma)}
          </p>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-[#2a2a2a]">
            Posts
          </p>
        </div>
        <div className="flex flex-col items-center py-4">
          <p
            className="mb-1 text-[17px] font-black leading-none"
            style={{ color: profile.comment_karma < 0 ? "#ff6030" : "#60a5fa" }}
          >
            {fmt(profile.comment_karma)}
          </p>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-[#2a2a2a]">
            Comments
          </p>
        </div>
      </div>

      <div className="h-px bg-[#101010]" />

      {/* Meta row */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <svg
            className="h-3 w-3 flex-shrink-0 text-[#242424]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-[11px] text-[#343434]">{joinDate}</span>
        </div>
        {followers > 0 && (
          <span className="text-[11px] text-[#343434]">
            {followers.toLocaleString()} followers
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <a
          href={`https://reddit.com/u/${profile.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[rgba(255,69,0,0.1)] bg-[rgba(255,69,0,0.04)] py-2.5 text-[12px] font-semibold text-[rgba(255,69,0,0.45)] transition-all hover:border-[rgba(255,69,0,0.22)] hover:bg-[rgba(255,69,0,0.08)] hover:text-[#ff4500]"
        >
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
          View on Reddit
        </a>
      </div>
    </div>
  );
}
