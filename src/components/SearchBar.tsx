"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRecentSearches } from "@/lib/use-recent-searches";

export default function SearchBar({
  initialValue = "",
  size = "large",
  maxWidthClass = "max-w-2xl",
}: {
  initialValue?: string;
  size?: "large" | "small";
  maxWidthClass?: string;
}) {
  const [username, setUsername] = useState(initialValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const { recents, addSearch, removeSearch, clearAll } = useRecentSearches();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = username.trim()
    ? recents.filter((r) =>
        r.toLowerCase().startsWith(username.trim().toLowerCase())
      )
    : recents;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = username
      .trim()
      .replace(/^https?:\/\/(www\.|old\.|new\.)?reddit\.com\//i, "")
      .replace(/^\/?(u|user)\//i, "")
      .replace(/\/+$/, "");
    if (cleaned.length === 0) return;
    addSearch(cleaned);
    setShowDropdown(false);
    router.push(`/search?username=${encodeURIComponent(cleaned)}`);
  };

  const selectRecent = (name: string) => {
    addSearch(name);
    setShowDropdown(false);
    router.push(`/search?username=${encodeURIComponent(name)}`);
  };

  const isLarge = size === "large";

  return (
    <div className={`relative w-full ${maxWidthClass}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div
          className={`flex flex-col gap-1.5 rounded-xl border border-card-border bg-card-bg transition-all focus-within:border-green-accent/50 focus-within:shadow-[0_0_20px_rgba(255,69,0,0.1)] sm:flex-row sm:items-center ${
            isLarge ? "p-2" : "p-1.5"
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center">
            <div className="flex items-center pl-3 text-zinc-500">
              <svg
                className={isLarge ? "h-5 w-5" : "h-4 w-4"}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => {
                if (blurTimer.current) clearTimeout(blurTimer.current);
                setShowDropdown(true);
              }}
              onBlur={() => {
                blurTimer.current = setTimeout(
                  () => setShowDropdown(false),
                  150
                );
              }}
              placeholder="Enter a Reddit username..."
              className={`min-w-0 flex-1 bg-transparent text-foreground placeholder-zinc-600 outline-none ${
                isLarge ? "px-2 py-2 text-base sm:text-lg" : "px-2 py-1.5 text-sm"
              }`}
              maxLength={50}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              name="reddit-lookup-field"
              id="reddit-lookup-field"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
          </div>
          <button
            type="submit"
            disabled={username.trim().length === 0}
            className={`w-full rounded-lg bg-green-accent font-semibold text-white transition-all hover:bg-[#cc3700] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto ${
              isLarge ? "px-6 py-2.5 text-sm sm:text-base" : "px-4 py-2 text-sm"
            }`}
          >
            Search
          </button>
        </div>
      </form>

      {showDropdown && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-[#1f1f1f] bg-[#0f0f0f] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#1a1a1a] px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#444]">
              Recent searches
            </span>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={clearAll}
              className="text-[11px] text-[#525252] transition-colors hover:text-[#ff4500]"
            >
              Clear all
            </button>
          </div>
          <ul>
            {filtered.map((name) => (
              <li key={name} className="flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-[#141414]">
                <svg
                  className="h-3.5 w-3.5 flex-shrink-0 text-[#3a3a3a]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                  <path
                    d="M12 6v6l4 2"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                </svg>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectRecent(name)}
                  className="min-w-0 flex-1 truncate text-left text-[13px] text-[#a0a0a0] transition-colors hover:text-white"
                >
                  u/{name}
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => removeSearch(name)}
                  className="flex-shrink-0 p-0.5 text-[#383838] transition-colors hover:text-[#707070]"
                  aria-label={`Remove ${name}`}
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
