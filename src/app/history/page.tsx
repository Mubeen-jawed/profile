"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Pagination from "@/components/Pagination";

interface SearchEntry {
  id: string;
  searchedUsername: string;
  postCount: number;
  commentCount: number;
  createdAt: string;
}

const HISTORY_PER_PAGE = 20;

export default function HistoryPage() {
  const [searches, setSearches] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (cancelled) return;
      if (!meData.user) {
        router.push("/signin");
        return;
      }
      setAuthorized(true);
    })();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    let cancelled = false;
    (async () => {
      const sp = new URLSearchParams();
      sp.set("page", String(page));
      sp.set("limit", String(HISTORY_PER_PAGE));
      const res = await fetch(`/api/history?${sp}`);
      if (cancelled) return;
      if (res.ok) {
        const data = await res.json();
        if (cancelled) return;
        setSearches(data.searches);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotal(data.pagination.total);
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [authorized, page]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-card-border border-t-green-accent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Search <span className="text-green-accent">History</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {total > 0
            ? `Showing ${(page - 1) * HISTORY_PER_PAGE + 1}–${Math.min(page * HISTORY_PER_PAGE, total)} of ${total} ${total === 1 ? "query" : "queries"}`
            : "Your recent research queries"}
        </p>
      </div>

      {total === 0 && searches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
            <svg className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-foreground">No searches yet</p>
          <p className="mt-1 text-sm text-zinc-500">Start searching to build your history</p>
          <Link href="/" className="mt-4 rounded-lg bg-green-accent px-5 py-2 text-sm font-bold text-white hover:bg-[#cc3700]">
            Search Now
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((s) => (
            <Link
              key={s.id}
              href={`/search?username=${encodeURIComponent(s.searchedUsername)}`}
              className="group block rounded-xl border border-card-border bg-card-bg p-4 transition-all hover:border-green-accent/30 hover:bg-[#141414]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-accent/10">
                  <svg className="h-5 w-5 text-green-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-foreground transition-colors group-hover:text-green-accent">
                    u/{s.searchedUsername}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {s.postCount} posts, {s.commentCount} comments
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-zinc-500">
                    {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                  <p className="text-[10px] text-zinc-600">
                    {new Date(s.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <svg className="hidden h-4 w-4 text-zinc-600 transition-colors group-hover:text-green-accent sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-card-border pt-2 sm:hidden">
                <div>
                  <p className="text-xs text-zinc-500">
                    {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                  <p className="text-[10px] text-zinc-600">
                    {new Date(s.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <svg className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-green-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="pt-4"
            />
          )}
        </div>
      )}
    </div>
  );
}
