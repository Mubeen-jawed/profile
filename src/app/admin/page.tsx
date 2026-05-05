"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "@/components/Pagination";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isPaid: boolean;
  searchCredits: number;
  avatarUrl: string | null;
  googleId: string | null;
  createdAt: string;
  searchCount: number;
}

interface RecentSearch {
  id: string;
  searchedUsername: string;
  postCount: number;
  commentCount: number;
  createdAt: string;
  performedBy: string;
  avatarUrl: string | null;
}

interface TopSearched {
  username: string;
  count: number;
}

interface DailySearch {
  date: string;
  count: number;
}

interface CacheEntry {
  id: string;
  searchedUsername: string;
  postCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalUsers: number;
  paidUsers: number;
  totalSearches: number;
  searchesToday: number;
  searchesThisWeek: number;
  totalAnonSessions: number;
  cacheCount: number;
  newUsersThisWeek: number;
}

interface NsfwCheck {
  id: string;
  checkedUsername: string;
  isNsfw: boolean;
  found: boolean;
  createdAt: string;
  performedBy: string;
  avatarUrl: string | null;
}

type Tab = "overview" | "users" | "searches" | "nsfw" | "cache";

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [topSearched, setTopSearched] = useState<TopSearched[]>([]);
  const [dailySearches, setDailySearches] = useState<DailySearch[]>([]);
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Pagination state
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const USERS_PER_PAGE = 20;

  const [searchLog, setSearchLog] = useState<RecentSearch[]>([]);
  const [searchLogPage, setSearchLogPage] = useState(1);
  const [searchLogTotalPages, setSearchLogTotalPages] = useState(1);
  const [searchLogTotal, setSearchLogTotal] = useState(0);
  const [searchLogLoading, setSearchLogLoading] = useState(false);
  const SEARCH_LOG_PER_PAGE = 20;

  const [cachePage, setCachePage] = useState(1);
  const [cacheTotalPages, setCacheTotalPages] = useState(1);
  const [cacheTotal, setCacheTotal] = useState(0);
  const CACHE_PER_PAGE = 20;

  const [nsfwChecks, setNsfwChecks] = useState<NsfwCheck[]>([]);
  const [nsfwPage, setNsfwPage] = useState(1);
  const [nsfwTotalPages, setNsfwTotalPages] = useState(1);
  const [nsfwTotal, setNsfwTotal] = useState(0);
  const [nsfwLoading, setNsfwLoading] = useState(false);
  const NSFW_PER_PAGE = 20;

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      if (!res.ok) {
        setLoginError("Invalid username or password");
        return;
      }
      setAuthenticated(true);
      fetchData();
      fetchCache();
      fetchSearchLog();
      fetchNsfwChecks();
    } catch {
      setLoginError("Something went wrong");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleAdminLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
  }

  async function fetchData(search = "", filter = "all", page = 1) {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filter !== "all") params.set("filter", filter);
      params.set("page", String(page));
      params.set("limit", String(USERS_PER_PAGE));

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.status === 403) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      if (!res.ok) return;

      setAuthenticated(true);
      const data = await res.json();
      setUsers(data.users);
      setStats(data.stats);
      setTopSearched(data.topSearched);
      setDailySearches(data.dailySearches);
      if (data.pagination) {
        setUsersTotalPages(data.pagination.totalPages);
        setUsersTotal(data.pagination.total);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function fetchCache(page = 1) {
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(CACHE_PER_PAGE));
      const res = await fetch(`/api/admin/cache?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCacheEntries(data.entries);
        if (data.pagination) {
          setCacheTotalPages(data.pagination.totalPages);
          setCacheTotal(data.pagination.total);
        }
      }
    } catch {
      // ignore
    }
  }

  async function fetchSearchLog(page = 1) {
    setSearchLogLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(SEARCH_LOG_PER_PAGE));
      const res = await fetch(`/api/admin/searches?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSearchLog(data.searches);
        if (data.totalPages) setSearchLogTotalPages(data.totalPages);
        if (typeof data.total === "number") setSearchLogTotal(data.total);
      }
    } catch {
      // ignore
    } finally {
      setSearchLogLoading(false);
    }
  }

  async function fetchNsfwChecks(page = 1) {
    setNsfwLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(NSFW_PER_PAGE));
      const res = await fetch(`/api/admin/nsfw-checks?${params}`);
      if (res.ok) {
        const data = await res.json();
        setNsfwChecks(data.checks);
        if (data.totalPages) setNsfwTotalPages(data.totalPages);
        if (typeof data.total === "number") setNsfwTotal(data.total);
      }
    } catch {
      // ignore
    } finally {
      setNsfwLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    fetchCache();
    fetchSearchLog();
    fetchNsfwChecks();
  }, []);

  useEffect(() => {
    setUsersPage(1);
  }, [userSearch, userFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(userSearch, userFilter, usersPage);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch, userFilter, usersPage]);

  useEffect(() => {
    if (authenticated) fetchCache(cachePage);
  }, [cachePage]);

  useEffect(() => {
    if (authenticated) fetchSearchLog(searchLogPage);
  }, [searchLogPage]);

  useEffect(() => {
    if (authenticated) fetchNsfwChecks(nsfwPage);
  }, [nsfwPage]);

  async function togglePaid(userId: string, isPaid: boolean) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: !isPaid }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isPaid: !isPaid } : u));
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
  }

  async function setCredits(userId: string, credits: number) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchCredits: credits }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, searchCredits: credits } : u));
  }

  async function deleteUser(userId: string) {
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setConfirmDelete(null);
    if (stats) setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
  }

  async function clearCache(id?: string) {
    const url = id ? `/api/admin/cache?id=${id}` : "/api/admin/cache";
    await fetch(url, { method: "DELETE" });
    if (stats) setStats({ ...stats, cacheCount: id ? Math.max(stats.cacheCount - 1, 0) : 0 });
    if (!id && cachePage !== 1) {
      setCachePage(1);
    } else {
      fetchCache(cachePage);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-card-border border-t-green-accent"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-accent/10 border border-green-accent/20">
              <svg className="h-7 w-7 text-green-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
            <p className="mt-1 text-sm text-zinc-500">Enter your credentials to continue</p>
          </div>
          <form onSubmit={handleAdminLogin} className="rounded-xl border border-card-border bg-card-bg p-6">
            {loginError && (
              <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{loginError}</div>
            )}
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
                autoFocus
                className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-foreground placeholder-zinc-600 outline-none transition-colors focus:border-green-accent/50"
                placeholder="Admin username"
              />
            </div>
            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-foreground placeholder-zinc-600 outline-none transition-colors focus:border-green-accent/50"
                placeholder="Admin password"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-lg bg-green-accent py-2.5 font-semibold text-white transition-colors hover:bg-[#cc3700] disabled:opacity-50"
            >
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const maxDaily = Math.max(...dailySearches.map((d) => d.count), 1);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Admin <span className="text-green-accent">Dashboard</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm">Manage users, monitor searches, and control your platform</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchData(userSearch, userFilter, usersPage); fetchCache(cachePage); fetchSearchLog(searchLogPage); fetchNsfwChecks(nsfwPage); }}
            className="flex items-center gap-2 rounded-lg border border-card-border bg-card-bg px-3 py-2 text-xs text-zinc-300 transition-colors hover:border-green-accent/30 sm:px-4 sm:text-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10 sm:px-4 sm:text-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg border border-card-border bg-card-bg p-1">
        {(["overview", "users", "searches", "nsfw", "cache"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium capitalize transition-all sm:px-4 sm:text-sm ${
              activeTab === tab
                ? "bg-green-accent text-white shadow-sm"
                : "text-zinc-400 hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Total Users" value={stats.totalUsers} icon="users" accent />
            <StatCard label="Paid Users" value={stats.paidUsers} icon="star" />
            <StatCard label="Searches Today" value={stats.searchesToday} icon="search" accent />
            <StatCard label="This Week" value={stats.searchesThisWeek} icon="chart" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Total Searches" value={stats.totalSearches} icon="database" />
            <StatCard label="New Users (7d)" value={stats.newUsersThisWeek} icon="plus" accent />
            <StatCard label="Anon Sessions" value={stats.totalAnonSessions} icon="eye" />
            <StatCard label="Cached Results" value={stats.cacheCount} icon="bolt" />
          </div>

          {/* Donut Chart + Line Chart Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* User Distribution Donut Chart */}
            <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:text-sm">User Distribution</h3>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
                <DonutChart
                  segments={[
                    { value: stats.paidUsers, color: "#eab308", label: "Paid" },
                    { value: Math.max(stats.totalUsers - stats.paidUsers, 0), color: "#3f3f46", label: "Free" },
                  ]}
                  total={stats.totalUsers}
                  centerLabel="Users"
                />
                <div className="flex flex-row gap-4 sm:flex-col sm:gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div>
                      <p className="text-xs text-zinc-400">Paid Users</p>
                      <p className="text-lg font-bold text-foreground">{stats.paidUsers}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-zinc-600" />
                    <div>
                      <p className="text-xs text-zinc-400">Free Users</p>
                      <p className="text-lg font-bold text-foreground">{Math.max(stats.totalUsers - stats.paidUsers, 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <div>
                      <p className="text-xs text-zinc-400">New (7d)</p>
                      <p className="text-lg font-bold text-green-accent">{stats.newUsersThisWeek}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Volume Line Chart */}
            <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:text-sm">Search Trend (7 Days)</h3>
              <LineChart data={dailySearches} />
            </div>
          </div>

          {/* Bar Chart + Top Searched Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Search Volume Bar Chart */}
            <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:text-sm">Daily Volume</h3>
              <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: 160 }}>
                {dailySearches.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-zinc-400 sm:text-xs">{d.count}</span>
                    <div
                      className="w-full rounded-t-md bg-green-accent/20 transition-all hover:bg-green-accent/40"
                      style={{ height: `${Math.max((d.count / maxDaily) * 120, 4)}px` }}
                    >
                      <div
                        className="h-full w-full rounded-t-md bg-green-accent/60"
                        style={{ height: `${Math.max((d.count / maxDaily) * 100, 10)}%` }}
                      />
                    </div>
                    <span className="text-[8px] text-zinc-600 sm:text-[10px]">{d.date.split(", ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Searched */}
            <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:text-sm">Top Searched Usernames</h3>
              {topSearched.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-600">No searches yet</p>
              ) : (
                <div className="space-y-2">
                  {topSearched.map((t, i) => {
                    const maxCount = topSearched[0]?.count || 1;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 text-right text-xs font-bold text-zinc-500">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-sm">
                            <span className="truncate font-medium text-green-accent">u/{t.username}</span>
                            <span className="ml-2 shrink-0 text-xs text-zinc-500">{t.count}</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                            <div className="h-full rounded-full bg-green-accent/50" style={{ width: `${(t.count / maxCount) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Platform Health */}
          <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:text-sm">Platform Health</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <HealthMeter
                label="Cache Utilization"
                value={stats.cacheCount}
                max={100}
                color="#ff4500"
              />
              <HealthMeter
                label="Conversion Rate"
                value={stats.totalUsers > 0 ? Math.round((stats.paidUsers / stats.totalUsers) * 100) : 0}
                max={100}
                suffix="%"
                color="#eab308"
              />
              <HealthMeter
                label="Searches / User"
                value={stats.totalUsers > 0 ? Math.round(stats.totalSearches / stats.totalUsers) : 0}
                max={Math.max(stats.totalUsers > 0 ? Math.round(stats.totalSearches / stats.totalUsers) : 0, 50)}
                color="#3b82f6"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-card-border bg-card-bg">
            <div className="flex flex-col gap-1 border-b border-card-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:text-sm">Recent Activity</h3>
              <span className="text-[10px] text-zinc-600 sm:text-xs">
                {searchLogTotal > 0 && (
                  <>Showing {(searchLogPage - 1) * SEARCH_LOG_PER_PAGE + 1}–{Math.min(searchLogPage * SEARCH_LOG_PER_PAGE, searchLogTotal)} of {searchLogTotal.toLocaleString()}</>
                )}
              </span>
            </div>
            <div className="divide-y divide-card-border">
              {searchLogLoading && searchLog.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-zinc-600">Loading…</p>
              ) : (
                searchLog.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-background/50 sm:gap-4 sm:px-5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-accent/10 text-xs font-bold text-green-accent">
                      {s.avatarUrl ? (
                        <img src={s.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
                      ) : (
                        s.performedBy[0]?.toUpperCase() || "?"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate sm:text-sm">
                        <span className="text-zinc-400">{s.performedBy}</span> searched{" "}
                        <span className="font-medium text-green-accent">u/{s.searchedUsername}</span>
                      </p>
                      <p className="text-[10px] text-zinc-600 sm:text-xs">
                        {s.postCount} posts, {s.commentCount} comments
                      </p>
                    </div>
                    <span className="hidden whitespace-nowrap text-xs text-zinc-600 sm:block">
                      {timeAgo(new Date(s.createdAt).getTime())}
                    </span>
                  </div>
                ))
              )}
              {!searchLogLoading && searchLog.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-zinc-600">No searches yet</p>
              )}
            </div>
            {searchLogTotalPages > 1 && (
              <div className="border-t border-card-border px-4 py-3 sm:px-5">
                <Pagination page={searchLogPage} totalPages={searchLogTotalPages} onPageChange={setSearchLogPage} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-lg border border-card-border bg-card-bg py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-zinc-600 outline-none transition-colors focus:border-green-accent/50"
              />
            </div>
            <div className="flex gap-1 rounded-lg border border-card-border bg-card-bg p-1">
              {["all", "paid", "free", "admin"].map((f) => (
                <button
                  key={f}
                  onClick={() => setUserFilter(f)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                    userFilter === f ? "bg-green-accent text-white" : "text-zinc-400 hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-zinc-500">
            {usersTotal > 0 ? (
              <>Showing {(usersPage - 1) * USERS_PER_PAGE + 1}–{Math.min(usersPage * USERS_PER_PAGE, usersTotal)} of {usersTotal.toLocaleString()} user{usersTotal !== 1 ? "s" : ""}</>
            ) : (
              <>{users.length} user{users.length !== 1 ? "s" : ""} found</>
            )}
          </p>

          {/* Users - Cards on mobile, Table on desktop */}
          <div className="hidden overflow-x-auto rounded-xl border border-card-border md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border bg-card-bg">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Credits</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Searches</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-card-bg/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-accent/10 text-sm font-bold text-green-accent overflow-hidden">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full" />
                          ) : (
                            user.username[0]?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-sm font-medium text-foreground hover:text-green-accent"
                          >
                            {user.username}
                          </Link>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "admin" ? "bg-green-accent/10 text-green-accent" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isPaid ? "bg-yellow-500/10 text-yellow-400" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {user.isPaid ? "Paid" : "Free"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {user.isPaid || user.role === "admin" ? (
                        <span className="text-green-accent">Unlimited</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{user.searchCredits}</span>
                          <div className="flex gap-0.5">
                            <button onClick={() => setCredits(user.id, 10)} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700" title="Reset to 10">10</button>
                            <button onClick={() => setCredits(user.id, 50)} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700" title="Set to 50">50</button>
                            <button onClick={() => setCredits(user.id, 100)} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700" title="Set to 100">100</button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{user.searchCount}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="rounded bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
                          title="Open user profile to send email or view history"
                        >
                          Email
                        </Link>
                        <button
                          onClick={() => togglePaid(user.id, user.isPaid)}
                          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                            user.isPaid
                              ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                              : "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                          }`}
                        >
                          {user.isPaid ? "Revoke" : "Paid"}
                        </button>
                        <button
                          onClick={() => toggleRole(user.id, user.role)}
                          className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700"
                        >
                          {user.role === "admin" ? "Demote" : "Admin"}
                        </button>
                        {confirmDelete === user.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => deleteUser(user.id)} className="rounded bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30">Confirm</button>
                            <button onClick={() => setConfirmDelete(null)} className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-400 hover:bg-zinc-700">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(user.id)} className="rounded bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="py-12 text-center text-sm text-zinc-600">No users found</p>
            )}
          </div>

          {/* Mobile User Cards */}
          <div className="space-y-3 md:hidden">
            {users.map((user) => (
              <div key={user.id} className="rounded-xl border border-card-border bg-card-bg p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-accent/10 text-sm font-bold text-green-accent overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="h-10 w-10 rounded-full" />
                    ) : (
                      user.username[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="block truncate text-sm font-medium text-foreground hover:text-green-accent"
                    >
                      {user.username}
                    </Link>
                    <p className="truncate text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      user.role === "admin" ? "bg-green-accent/10 text-green-accent" : "bg-zinc-800 text-zinc-400"
                    }`}>{user.role}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      user.isPaid ? "bg-yellow-500/10 text-yellow-400" : "bg-zinc-800 text-zinc-400"
                    }`}>{user.isPaid ? "Paid" : "Free"}</span>
                  </div>
                </div>
                <div className="mb-3 grid grid-cols-3 gap-2 rounded-lg bg-background p-2.5">
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">Credits</p>
                    <p className="text-sm font-semibold text-foreground">
                      {user.isPaid || user.role === "admin" ? <span className="text-green-accent text-xs">Unlimited</span> : user.searchCredits}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">Searches</p>
                    <p className="text-sm font-semibold text-foreground">{user.searchCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">Joined</p>
                    <p className="text-xs font-semibold text-foreground">
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="rounded bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-400"
                  >
                    Email
                  </Link>
                  <button
                    onClick={() => togglePaid(user.id, user.isPaid)}
                    className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      user.isPaid ? "bg-zinc-800 text-zinc-400" : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {user.isPaid ? "Revoke Paid" : "Make Paid"}
                  </button>
                  <button
                    onClick={() => toggleRole(user.id, user.role)}
                    className="rounded bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-400"
                  >
                    {user.role === "admin" ? "Demote" : "Make Admin"}
                  </button>
                  {!user.isPaid && user.role !== "admin" && (
                    <div className="flex gap-1">
                      {[20, 50, 100].map((c) => (
                        <button key={c} onClick={() => setCredits(user.id, c)} className="rounded bg-zinc-800 px-2 py-1.5 text-[10px] text-zinc-400">{c} cr</button>
                      ))}
                    </div>
                  )}
                  {confirmDelete === user.id ? (
                    <div className="flex gap-1 ml-auto">
                      <button onClick={() => deleteUser(user.id)} className="rounded bg-red-500/20 px-2.5 py-1.5 text-xs font-medium text-red-400">Confirm</button>
                      <button onClick={() => setConfirmDelete(null)} className="rounded bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-400">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(user.id)} className="ml-auto rounded bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400">Delete</button>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p className="py-12 text-center text-sm text-zinc-600">No users found</p>
            )}
          </div>

          {usersTotalPages > 1 && (
            <Pagination page={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} className="pt-2" />
          )}
        </div>
      )}

      {/* SEARCHES TAB */}
      {activeTab === "searches" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Searched */}
            <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:text-sm">Most Searched Usernames</h3>
              {topSearched.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-600">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {topSearched.map((t, i) => {
                    const maxCount = topSearched[0]?.count || 1;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          i < 3 ? "bg-green-accent/10 text-green-accent" : "bg-zinc-800 text-zinc-500"
                        }`}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="truncate text-sm font-medium text-foreground">u/{t.username}</span>
                            <span className="ml-2 shrink-0 text-sm font-bold text-green-accent">{t.count}</span>
                          </div>
                          <div className="mt-1 h-1 overflow-hidden rounded-full bg-zinc-800">
                            <div className="h-full rounded-full bg-green-accent/50" style={{ width: `${(t.count / maxCount) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Search Volume Chart */}
            <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:text-sm">Daily Volume (7 Days)</h3>
              <div className="flex items-end gap-1.5 sm:gap-3" style={{ height: 200 }}>
                {dailySearches.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-foreground sm:text-sm">{d.count}</span>
                    <div className="w-full overflow-hidden rounded-lg bg-zinc-800" style={{ height: 140 }}>
                      <div
                        className="w-full rounded-lg bg-gradient-to-t from-green-accent/40 to-green-accent/80 transition-all"
                        style={{ height: `${Math.max((d.count / maxDaily) * 100, 3)}%`, marginTop: "auto" }}
                      />
                    </div>
                    <span className="text-[8px] text-zinc-500 text-center leading-tight sm:text-[10px]">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Search Log */}
          <div className="rounded-xl border border-card-border bg-card-bg">
            <div className="flex flex-col gap-1 border-b border-card-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:text-sm">Search Log</h3>
              <span className="text-[10px] text-zinc-600 sm:text-xs">
                {searchLogTotal > 0 && (
                  <>Showing {(searchLogPage - 1) * SEARCH_LOG_PER_PAGE + 1}–{Math.min(searchLogPage * SEARCH_LOG_PER_PAGE, searchLogTotal)} of {searchLogTotal.toLocaleString()}</>
                )}
              </span>
            </div>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-card-border">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Searched</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">By</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Posts</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Comments</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {searchLog.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-background/50">
                      <td className="px-4 py-2.5 text-sm font-medium text-green-accent">u/{s.searchedUsername}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-300">{s.performedBy}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-400">{s.postCount}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-400">{s.commentCount}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-500">
                        {new Date(s.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {searchLog.length === 0 && !searchLogLoading && (
                <p className="py-12 text-center text-sm text-zinc-600">No searches yet</p>
              )}
            </div>
            {/* Mobile list */}
            <div className="divide-y divide-card-border sm:hidden">
              {searchLog.map((s) => (
                <div key={s.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-accent">u/{s.searchedUsername}</span>
                    <span className="text-[10px] text-zinc-600">
                      {new Date(s.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    by {s.performedBy} &middot; {s.postCount} posts, {s.commentCount} comments
                  </p>
                </div>
              ))}
              {searchLog.length === 0 && !searchLogLoading && (
                <p className="py-12 text-center text-sm text-zinc-600">No searches yet</p>
              )}
            </div>
            {searchLogTotalPages > 1 && (
              <div className="border-t border-card-border px-4 py-3 sm:px-5">
                <Pagination page={searchLogPage} totalPages={searchLogTotalPages} onPageChange={setSearchLogPage} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* NSFW TAB */}
      {activeTab === "nsfw" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-card-border bg-card-bg">
            <div className="flex flex-col gap-1 border-b border-card-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:text-sm">
                NSFW Profile Checks
              </h3>
              <span className="text-[10px] text-zinc-600 sm:text-xs">
                {nsfwTotal > 0 && (
                  <>Showing {(nsfwPage - 1) * NSFW_PER_PAGE + 1}–{Math.min(nsfwPage * NSFW_PER_PAGE, nsfwTotal)} of {nsfwTotal.toLocaleString()}</>
                )}
              </span>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-card-border">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Checked</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">By</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Result</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {nsfwChecks.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-background/50">
                      <td className="px-4 py-2.5 text-sm font-medium text-green-accent">u/{c.checkedUsername}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-300">{c.performedBy}</td>
                      <td className="px-4 py-2.5">
                        {!c.found ? (
                          <span className="inline-flex rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">Not found</span>
                        ) : c.isNsfw ? (
                          <span className="inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">🔞 NSFW</span>
                        ) : (
                          <span className="inline-flex rounded-full bg-green-accent/10 px-2 py-0.5 text-xs font-medium text-green-accent">Safe</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-zinc-500">
                        {new Date(c.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {nsfwChecks.length === 0 && !nsfwLoading && (
                <p className="py-12 text-center text-sm text-zinc-600">No NSFW checks yet</p>
              )}
            </div>

            {/* Mobile list */}
            <div className="divide-y divide-card-border sm:hidden">
              {nsfwChecks.map((c) => (
                <div key={c.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-accent">u/{c.checkedUsername}</span>
                    <span className="text-[10px] text-zinc-600">
                      {new Date(c.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">by {c.performedBy}</span>
                    {!c.found ? (
                      <span className="inline-flex rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">Not found</span>
                    ) : c.isNsfw ? (
                      <span className="inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">🔞 NSFW</span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-accent/10 px-2 py-0.5 text-[10px] font-medium text-green-accent">Safe</span>
                    )}
                  </div>
                </div>
              ))}
              {nsfwChecks.length === 0 && !nsfwLoading && (
                <p className="py-12 text-center text-sm text-zinc-600">No NSFW checks yet</p>
              )}
            </div>

            {nsfwTotalPages > 1 && (
              <div className="border-t border-card-border px-4 py-3 sm:px-5">
                <Pagination page={nsfwPage} totalPages={nsfwTotalPages} onPageChange={setNsfwPage} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* CACHE TAB */}
      {activeTab === "cache" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400 sm:text-sm">
              {cacheTotal > 0 ? (
                <>Showing {(cachePage - 1) * CACHE_PER_PAGE + 1}–{Math.min(cachePage * CACHE_PER_PAGE, cacheTotal)} of {cacheTotal.toLocaleString()} cached result{cacheTotal !== 1 ? "s" : ""}</>
              ) : (
                <>{cacheEntries.length} cached result{cacheEntries.length !== 1 ? "s" : ""}</>
              )}
            </p>
            {cacheEntries.length > 0 && (
              <button
                onClick={() => clearCache()}
                className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 sm:px-4 sm:py-2 sm:text-sm"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Clear All
              </button>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-card-border sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border bg-card-bg">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Posts</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Comments</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Cached At</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Expires</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {cacheEntries.map((entry) => {
                  const expiresAt = new Date(new Date(entry.updatedAt).getTime() + 30 * 60 * 1000);
                  const isExpired = expiresAt < new Date();
                  return (
                    <tr key={entry.id} className="transition-colors hover:bg-card-bg/50">
                      <td className="px-4 py-3 text-sm font-medium text-green-accent">u/{entry.searchedUsername}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{entry.postCount}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{entry.commentCount}</td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {new Date(entry.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          isExpired ? "bg-red-500/10 text-red-400" : "bg-green-accent/10 text-green-accent"
                        }`}>
                          {isExpired ? "Expired" : `${Math.ceil((expiresAt.getTime() - Date.now()) / 60000)}m left`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => clearCache(entry.id)} className="rounded bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20">Remove</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {cacheEntries.length === 0 && (
              <p className="py-12 text-center text-sm text-zinc-600">No cached results</p>
            )}
          </div>

          {/* Mobile cache cards */}
          <div className="space-y-3 sm:hidden">
            {cacheEntries.map((entry) => {
              const expiresAt = new Date(new Date(entry.updatedAt).getTime() + 30 * 60 * 1000);
              const isExpired = expiresAt < new Date();
              return (
                <div key={entry.id} className="rounded-xl border border-card-border bg-card-bg p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-green-accent">u/{entry.searchedUsername}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      isExpired ? "bg-red-500/10 text-red-400" : "bg-green-accent/10 text-green-accent"
                    }`}>
                      {isExpired ? "Expired" : `${Math.ceil((expiresAt.getTime() - Date.now()) / 60000)}m left`}
                    </span>
                  </div>
                  <div className="mb-3 flex gap-4 text-xs text-zinc-400">
                    <span>{entry.postCount} posts</span>
                    <span>{entry.commentCount} comments</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-600">
                      Cached {new Date(entry.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <button onClick={() => clearCache(entry.id)} className="rounded bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400">Remove</button>
                  </div>
                </div>
              );
            })}
            {cacheEntries.length === 0 && (
              <p className="py-12 text-center text-sm text-zinc-600">No cached results</p>
            )}
          </div>

          {cacheTotalPages > 1 && (
            <Pagination page={cachePage} totalPages={cacheTotalPages} onPageChange={setCachePage} className="pt-2" />
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ CHART COMPONENTS ═══════════════ */

function DonutChart({ segments, total, centerLabel }: {
  segments: { value: number; color: string; label: string }[];
  total: number;
  centerLabel: string;
}) {
  const size = 140;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {total === 0 ? (
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#27272a" strokeWidth={strokeWidth} />
        ) : (
          segments.map((seg, i) => {
            const pct = seg.value / total;
            const dash = pct * circumference;
            const gap = circumference - dash;
            const currentOffset = offset;
            offset += dash;
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-currentOffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })
        )}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-foreground">{total}</span>
        <span className="text-[10px] text-zinc-500">{centerLabel}</span>
      </div>
    </div>
  );
}

function LineChart({ data }: { data: DailySearch[] }) {
  if (data.length === 0) return <p className="py-8 text-center text-sm text-zinc-600">No data yet</p>;

  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const width = 100;
  const height = 50;
  const padding = 2;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padding + chartH - (d.count / maxVal) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${height - padding} L${points[0].x},${height - padding} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 160 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff4500" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#lineGrad)" />
        <path d={linePath} fill="none" stroke="#ff4500" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1" fill="#ff4500" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-[10px] font-medium text-zinc-400 sm:text-xs">{d.count}</span>
            <span className="text-[8px] text-zinc-600 sm:text-[10px]">{d.date.split(", ")[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HealthMeter({ label, value, max, color, suffix = "" }: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className="rounded-lg bg-background p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className="text-sm font-bold text-foreground">{value}{suffix}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: number; icon: string; accent?: boolean }) {
  const icons: Record<string, React.ReactNode> = {
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
    database: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />,
    eye: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />,
    bolt: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />,
  };

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-3 transition-all hover:border-green-accent/10 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <svg className="h-4 w-4 text-zinc-600 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icons[icon]}
        </svg>
      </div>
      <p className={`text-xl font-bold sm:text-2xl ${accent ? "text-green-accent" : "text-foreground"}`}>
        {value.toLocaleString()}
      </p>
      <p className="mt-0.5 text-[10px] text-zinc-500 sm:text-xs">{label}</p>
    </div>
  );
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
