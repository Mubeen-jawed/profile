import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ];
    }

    if (filter === "paid") where.isPaid = true;
    if (filter === "free") where.isPaid = false;
    if (filter === "admin") where.role = "admin";

    // Run independent queries in parallel
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Build daily date ranges for batch query
    const dailyRanges: { start: Date; end: Date; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      dailyRanges.push({
        start: dayStart,
        end: dayEnd,
        label: dayStart.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      });
    }

    const [
      users,
      filteredUserCount,
      totalSearches,
      searchesToday,
      paidUsers,
      totalUsers,
      searchesThisWeek,
      totalAnonSessions,
      topSearched,
      recentSearches,
      cacheCount,
      newUsersThisWeek,
      ...dailyCounts
    ] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isPaid: true,
          searchCredits: true,
          avatarUrl: true,
          googleId: true,
          createdAt: true,
          _count: { select: { searchLogs: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
      prisma.searchLog.count(),
      prisma.searchLog.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { isPaid: true } }),
      prisma.user.count(),
      prisma.searchLog.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.anonCredit.count(),
      prisma.searchLog.groupBy({
        by: ["searchedUsername"],
        _count: { searchedUsername: true },
        orderBy: { _count: { searchedUsername: "desc" } },
        take: 10,
      }),
      prisma.searchLog.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true, avatarUrl: true } } },
      }),
      prisma.searchCache.count(),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      // Daily search counts - all in parallel instead of sequential loop
      ...dailyRanges.map((range) =>
        prisma.searchLog.count({
          where: { createdAt: { gte: range.start, lte: range.end } },
        })
      ),
    ]);

    const dailySearches = dailyRanges.map((range, i) => ({
      date: range.label,
      count: dailyCounts[i] as number,
    }));

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        searchCount: u._count.searchLogs,
        _count: undefined,
      })),
      pagination: {
        page,
        limit,
        total: filteredUserCount,
        totalPages: Math.max(1, Math.ceil(filteredUserCount / limit)),
      },
      stats: {
        totalUsers,
        paidUsers,
        totalSearches,
        searchesToday,
        searchesThisWeek,
        totalAnonSessions,
        cacheCount,
        newUsersThisWeek,
      },
      topSearched: topSearched.map((t) => ({
        username: t.searchedUsername,
        count: t._count.searchedUsername,
      })),
      dailySearches,
      recentSearches: recentSearches.map((s) => ({
        id: s.id,
        searchedUsername: s.searchedUsername,
        postCount: s.postCount,
        commentCount: s.commentCount,
        createdAt: s.createdAt,
        performedBy: s.user?.username ?? "Anonymous",
        avatarUrl: s.user?.avatarUrl ?? null,
      })),
    });
  } catch (err) {
    console.error("[admin/users] Failed to fetch data:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
