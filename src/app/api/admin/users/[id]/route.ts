import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const [
      user,
      searchLogsTotal,
      searchLogs,
      uniqueSearched,
      topSearched,
      activityRows,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
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
        },
      }),
      prisma.searchLog.count({ where: { userId: id } }),
      prisma.searchLog.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.searchLog.findMany({
        where: { userId: id },
        select: { searchedUsername: true },
        distinct: ["searchedUsername"],
      }),
      prisma.searchLog.groupBy({
        by: ["searchedUsername"],
        where: { userId: id },
        _count: { searchedUsername: true },
        orderBy: { _count: { searchedUsername: "desc" } },
        take: 10,
      }),
      prisma.searchLog.findMany({
        where: { userId: id },
        select: { createdAt: true, postCount: true, commentCount: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const dailyBuckets: { date: string; iso: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * dayMs);
      d.setHours(0, 0, 0, 0);
      dailyBuckets.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        iso: d.toISOString().slice(0, 10),
        count: 0,
      });
    }
    const dailyIndex = new Map(dailyBuckets.map((b, i) => [b.iso, i]));

    const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
    let totalPosts = 0;
    let totalComments = 0;

    for (const row of activityRows) {
      const day = row.createdAt.toISOString().slice(0, 10);
      const idx = dailyIndex.get(day);
      if (idx !== undefined) dailyBuckets[idx].count += 1;
      hourlyActivity[row.createdAt.getHours()].count += 1;
      totalPosts += row.postCount;
      totalComments += row.commentCount;
    }

    return NextResponse.json({
      user: { ...user, searchLogs },
      uniqueSearched: uniqueSearched.map((u) => u.searchedUsername),
      pagination: {
        page,
        limit,
        total: searchLogsTotal,
        totalPages: Math.max(1, Math.ceil(searchLogsTotal / limit)),
      },
      analytics: {
        dailyActivity: dailyBuckets.map(({ date, count }) => ({ date, count })),
        hourlyActivity,
        topSearched: topSearched.map((t) => ({
          username: t.searchedUsername,
          count: t._count.searchedUsername,
        })),
        totalPosts,
        totalComments,
      },
    });
  } catch (err) {
    console.error("[admin/users/id] GET failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (typeof body.isPaid === "boolean") data.isPaid = body.isPaid;
    if (typeof body.searchCredits === "number") {
      if (body.searchCredits < 0 || body.searchCredits > 1000) {
        return NextResponse.json({ error: "Credits must be between 0 and 1000" }, { status: 400 });
      }
      data.searchCredits = body.searchCredits;
    }
    if (typeof body.role === "string" && ["user", "admin"].includes(body.role)) data.role = body.role;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[admin/users/id] PATCH failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Delete user's search logs first, then the user
    await prisma.searchLog.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/users/id] DELETE failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
