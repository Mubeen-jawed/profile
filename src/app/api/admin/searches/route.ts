import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const [total, searches] = await Promise.all([
      prisma.searchLog.count(),
      prisma.searchLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true, avatarUrl: true } } },
      }),
    ]);

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      searches: searches.map((s) => ({
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
    console.error("[admin/searches] GET failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
