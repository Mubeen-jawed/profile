"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Pagination from "@/components/Pagination";

const SEARCH_LOG_PER_PAGE = 20;

interface SearchLog {
  id: string;
  searchedUsername: string;
  postCount: number;
  commentCount: number;
  createdAt: string;
}

interface UserDetail {
  id: string;
  email: string;
  username: string;
  role: string;
  isPaid: boolean;
  searchCredits: number;
  createdAt: string;
  searchLogs: SearchLog[];
}

interface DailyPoint {
  date: string;
  count: number;
}

interface HourlyPoint {
  hour: number;
  count: number;
}

interface TopSearchedItem {
  username: string;
  count: number;
}

interface Analytics {
  dailyActivity: DailyPoint[];
  hourlyActivity: HourlyPoint[];
  topSearched: TopSearchedItem[];
  totalPosts: number;
  totalComments: number;
}

export default function AdminUserDetail() {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [uniqueSearched, setUniqueSearched] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const fetchUser = useCallback(
    async (p: number) => {
      try {
        const sp = new URLSearchParams();
        sp.set("page", String(p));
        sp.set("limit", String(SEARCH_LOG_PER_PAGE));
        const res = await fetch(`/api/admin/users/${userId}?${sp}`);
        if (res.status === 403) {
          router.push("/admin");
          return;
        }
        if (!res.ok) {
          setError("User not found");
          return;
        }
        const data = await res.json();
        setUser(data.user);
        if (Array.isArray(data.uniqueSearched))
          setUniqueSearched(data.uniqueSearched);
        if (data.analytics) setAnalytics(data.analytics);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotal(data.pagination.total);
        }
        setAuthorized(true);
      } catch {
        setError("Something went wrong");
      }
    },
    [userId, router],
  );

  useEffect(() => {
    fetchUser(1).finally(() => setLoading(false));
  }, [fetchUser]);

  useEffect(() => {
    if (authorized && page > 1) fetchUser(page);
  }, [authorized, page, fetchUser]);

  async function togglePaid() {
    if (!user) return;
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: !user.isPaid }),
    });
    setUser({ ...user, isPaid: !user.isPaid });
  }

  async function resetCredits() {
    if (!user) return;
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchCredits: 10 }),
    });
    setUser({ ...user, searchCredits: 10 });
  }

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  async function sendEmail() {
    if (!user) return;
    setEmailStatus(null);

    const subject = emailSubject.trim();
    const body = emailBody.trim();
    if (!subject || !body) {
      setEmailStatus({
        kind: "error",
        message: "Subject and message are required.",
      });
      return;
    }

    setEmailSending(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json().catch(() => ({}) as { error?: string });
      if (!res.ok) {
        setEmailStatus({
          kind: "error",
          message: data?.error || `Failed (${res.status})`,
        });
        return;
      }
      setEmailStatus({
        kind: "success",
        message: `Email sent to ${user.email}.`,
      });
      setEmailSubject("");
      setEmailBody("");
    } catch {
      setEmailStatus({
        kind: "error",
        message: "Network error, please try again.",
      });
    } finally {
      setEmailSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-card-border border-t-green-accent"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-red-400">{error || "User not found"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-green-accent"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Dashboard
      </Link>

      {/* User Header */}
      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-card-border bg-card-bg p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-accent text-xl font-bold text-white">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              {user.username}
            </h1>
            <p className="break-all text-sm text-zinc-400">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.role === "admin" ? "bg-green-accent/10 text-green-accent" : "bg-zinc-800 text-zinc-400"}`}
              >
                {user.role}
              </span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.isPaid ? "bg-yellow-500/10 text-yellow-400" : "bg-zinc-800 text-zinc-400"}`}
              >
                {user.isPaid ? "Paid" : "Free"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <button
            onClick={togglePaid}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${user.isPaid ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"}`}
          >
            {user.isPaid ? "Revoke Paid" : "Make Paid"}
          </button>
          {!user.isPaid && user.role !== "admin" && (
            <button
              onClick={resetCredits}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
            >
              Reset Credits
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-card-border bg-card-bg p-4">
          <p className="text-xs text-zinc-500">Total Searches</p>
          <p className="text-xl font-bold text-green-accent sm:text-2xl">
            {total}
          </p>
        </div>
        <div className="rounded-xl border border-card-border bg-card-bg p-4">
          <p className="text-xs text-zinc-500">Credits Left</p>
          <p className="text-xl font-bold text-foreground sm:text-2xl">
            {user.isPaid || user.role === "admin" ? "∞" : user.searchCredits}
          </p>
        </div>
        <div className="rounded-xl border border-card-border bg-card-bg p-4">
          <p className="text-xs text-zinc-500">Unique Usernames</p>
          <p className="text-xl font-bold text-foreground sm:text-2xl">
            {uniqueSearched.length}
          </p>
        </div>
        <div className="rounded-xl border border-card-border bg-card-bg p-4">
          <p className="text-xs text-zinc-500">Joined</p>
          <p className="text-lg font-bold text-foreground">
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Analytics */}
      {analytics &&
        (analytics.dailyActivity.length > 0 ||
          analytics.topSearched.length > 0) && (
          <div className="mb-8 space-y-4">
            {/* Posts vs Comments split */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-card-border bg-card-bg p-4">
                <p className="text-xs text-zinc-500">Total Posts Pulled</p>
                <p className="mt-1 text-2xl font-bold text-green-accent">
                  {analytics.totalPosts.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-card-border bg-card-bg p-4">
                <p className="text-xs text-zinc-500">Total Comments Pulled</p>
                <p className="mt-1 text-2xl font-bold text-blue-400">
                  {analytics.totalComments.toLocaleString()}
                </p>
              </div>
            </div>

            {/* 30-day activity */}
            <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground">
                  Activity, last 30 days
                </h2>
                <span className="text-xs text-zinc-500">
                  {analytics.dailyActivity.reduce((s, d) => s + d.count, 0)}{" "}
                  searches
                </span>
              </div>
              <DailyBarChart data={analytics.dailyActivity} />
            </div>

            {/* Hourly distribution + Top searched, side-by-side on desktop */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
                <h2 className="mb-4 text-sm font-bold text-foreground">
                  Active hours (UTC)
                </h2>
                <HourlyChart data={analytics.hourlyActivity} />
              </div>
              <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
                <h2 className="mb-4 text-sm font-bold text-foreground">
                  Top searched usernames
                </h2>
                <TopSearchedChart data={analytics.topSearched} />
              </div>
            </div>
          </div>
        )}

      {/* Send Email */}
      <div className="mb-8 rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">Send Email</h2>
          <span className="text-xs text-zinc-500">to {user.email}</span>
        </div>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="email-subject"
              className="mb-1 block text-xs font-medium text-zinc-400"
            >
              Subject
            </label>
            <input
              id="email-subject"
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="A note from redditprofile"
              maxLength={200}
              disabled={emailSending}
              className="w-full rounded-lg border border-card-border bg-black/40 px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 focus:border-green-accent focus:outline-none disabled:opacity-60"
            />
          </div>
          <div>
            <label
              htmlFor="email-body"
              className="mb-1 block text-xs font-medium text-zinc-400"
            >
              Message
            </label>
            <textarea
              id="email-body"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Write your message... Plain text, paragraphs separated by blank lines."
              maxLength={10000}
              rows={8}
              disabled={emailSending}
              className="w-full resize-y rounded-lg border border-card-border bg-black/40 px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 focus:border-green-accent focus:outline-none disabled:opacity-60"
            />
            <p className="mt-1 text-[11px] text-zinc-600">
              {emailBody.length}/10000 · Replies will go to your support inbox.
            </p>
          </div>
          {emailStatus && (
            <p
              role="status"
              className={`text-xs ${emailStatus.kind === "success" ? "text-green-accent" : "text-red-400"}`}
            >
              {emailStatus.message}
            </p>
          )}
          <div className="flex justify-end">
            <button
              onClick={sendEmail}
              disabled={
                emailSending || !emailSubject.trim() || !emailBody.trim()
              }
              className="rounded-lg bg-green-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#cc3700] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {emailSending ? "Sending…" : "Send Email"}
            </button>
          </div>
        </div>
      </div>

      {/* Usernames Searched */}
      {uniqueSearched.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-foreground">
            Usernames Searched
          </h2>
          <div className="flex flex-wrap gap-2">
            {uniqueSearched.map((u) => (
              <span
                key={u}
                className="rounded-lg bg-green-accent/10 px-3 py-1 text-sm font-medium text-green-accent border border-green-accent/20"
              >
                u/{u}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search History */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Search History</h2>
          {total > 0 && (
            <p className="text-xs text-zinc-500">
              Showing {(page - 1) * SEARCH_LOG_PER_PAGE + 1}–
              {Math.min(page * SEARCH_LOG_PER_PAGE, total)} of {total}
            </p>
          )}
        </div>
        <div className="overflow-hidden rounded-xl border border-card-border">
          <table className="hidden w-full sm:table">
            <thead>
              <tr className="border-b border-card-border bg-card-bg">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Posts
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Comments
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  When
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {user.searchLogs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-card-bg">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-green-accent">
                    u/{log.searchedUsername}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-400">
                    {log.postCount}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-400">
                    {log.commentCount}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-500">
                    {new Date(log.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
              {user.searchLogs.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-zinc-500"
                  >
                    No searches yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="divide-y divide-card-border sm:hidden">
            {user.searchLogs.map((log) => (
              <div key={log.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium text-green-accent">
                    u/{log.searchedUsername}
                  </span>
                  <span className="shrink-0 text-[10px] text-zinc-600">
                    {new Date(log.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {log.postCount} posts, {log.commentCount} comments
                </p>
              </div>
            ))}
            {user.searchLogs.length === 0 && (
              <p className="px-4 py-8 text-center text-zinc-500">
                No searches yet.
              </p>
            )}
          </div>
        </div>
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
    </div>
  );
}

function DailyBarChart({ data }: { data: DailyPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-600">No activity yet</p>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const width = 600;
  const height = 140;
  const barWidth = width / data.length;
  const padding = 2;

  return (
    <div className="overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: 140 }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="dailyBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff4500" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff4500" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const barHeight = (d.count / maxVal) * (height - 8);
          const x = i * barWidth + padding;
          const y = height - barHeight;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={Math.max(barWidth - padding * 2, 1)}
                height={barHeight}
                fill={d.count > 0 ? "url(#dailyBarGrad)" : "#1a1a1a"}
                rx={1}
              >
                <title>
                  {d.date}: {d.count} searches
                </title>
              </rect>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
        <span>{data[0]?.date}</span>
        <span>{data[Math.floor(data.length / 2)]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function HourlyChart({ data }: { data: HourlyPoint[] }) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const totalSearches = data.reduce((s, d) => s + d.count, 0);

  if (totalSearches === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-600">No activity yet</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-[2px] h-32">
        {data.map((d) => {
          const heightPct = (d.count / maxVal) * 100;
          return (
            <div
              key={d.hour}
              className="group relative flex-1 flex flex-col items-center justify-end"
              title={`${String(d.hour).padStart(2, "0")}:00, ${d.count} searches`}
            >
              <div
                className={`w-full rounded-t transition-all ${
                  d.count > 0
                    ? "bg-green-accent/70 group-hover:bg-green-accent"
                    : "bg-zinc-800"
                }`}
                style={{
                  height: `${Math.max(heightPct, d.count > 0 ? 4 : 2)}%`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-zinc-600 px-[1px]">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>
    </div>
  );
}

function TopSearchedChart({ data }: { data: TopSearchedItem[] }) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-600">No searches yet</p>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      {data.map((item) => {
        const widthPct = (item.count / maxVal) * 100;
        return (
          <div key={item.username} className="group">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="truncate font-medium text-zinc-300">
                u/{item.username}
              </span>
              <span className="ml-2 shrink-0 tabular-nums text-zinc-500">
                {item.count}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-accent to-green-accent/60 transition-all duration-500 group-hover:from-green-accent group-hover:to-green-accent"
                style={{ width: `${Math.max(widthPct, 2)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
