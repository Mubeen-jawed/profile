"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRecentSearches } from "@/lib/use-recent-searches";

export default function LandingSearchForm() {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const { recents, addSearch, removeSearch, clearAll } = useRecentSearches();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = query.trim()
    ? recents.filter((r) =>
        r.toLowerCase().startsWith(query.trim().toLowerCase()),
      )
    : recents;

  const handleSearch = useCallback(() => {
    const clean = query
      .replace(/^https?:\/\/(www\.|old\.|new\.)?reddit\.com\//i, "")
      .replace(/^\/?(u|user)\//i, "")
      .replace(/\/+$/, "")
      .trim();
    if (!clean) return;
    addSearch(clean);
    setShowDropdown(false);
    router.push(`/search?username=${encodeURIComponent(clean)}`);
  }, [query, router, addSearch]);

  const selectRecent = (name: string) => {
    addSearch(name);
    setShowDropdown(false);
    router.push(`/search?username=${encodeURIComponent(name)}`);
  };

  return (
    <div className="search-wrap">
      <div className="search-anchor">
        <div className="search-box" role="search">
          <svg
            className="search-icon"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <span className="search-pre" aria-hidden="true">
            u/
          </span>

          <input
            className="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            onFocus={() => {
              if (blurTimer.current) clearTimeout(blurTimer.current);
              setShowDropdown(true);
            }}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setShowDropdown(false), 150);
            }}
            placeholder="username"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Reddit username"
            maxLength={40}
            autoFocus
          />

          <button
            className="search-btn"
            onClick={handleSearch}
            disabled={!query.trim()}
            aria-label="Search"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span>Search</span>
          </button>
        </div>

        {showDropdown && filtered.length > 0 && (
          <div className="recent-dropdown">
            <div className="recent-dropdown-header">
              <span className="recent-dropdown-label">Recent searches</span>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={clearAll}
                className="recent-dropdown-clear"
              >
                Clear all
              </button>
            </div>
            <ul className="recent-dropdown-list">
              {filtered.map((name) => (
                <li key={name} className="recent-dropdown-item">
                  <svg
                    className="recent-dropdown-clock"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                    <path d="M12 6v6l4 2" strokeWidth="1.5" />
                  </svg>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectRecent(name)}
                    className="recent-dropdown-name"
                  >
                    u/{name}
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => removeSearch(name)}
                    className="recent-dropdown-remove"
                    aria-label={`Remove ${name}`}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="search-hint">
        Works with any Reddit username, just type and hit Search
      </p>
    </div>
  );
}
