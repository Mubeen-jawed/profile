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

    const [total, checks] = await Promise.all([
      prisma.nsfwCheck.count(),
      prisma.nsfwCheck.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const userIds = Array.from(
      new Set(checks.map((c) => c.userId).filter((v): v is string => Boolean(v)))
    );
    const users = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, username: true, avatarUrl: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      checks: checks.map((c) => {
        const u = c.userId ? userMap.get(c.userId) : null;
        return {
          id: c.id,
          checkedUsername: c.checkedUsername,
          isNsfw: c.isNsfw,
          found: c.found,
          createdAt: c.createdAt,
          performedBy: u?.username ?? "Anonymous",
          avatarUrl: u?.avatarUrl ?? null,
        };
      }),
    });
  } catch (err) {
    console.error("[admin/nsfw-checks] GET failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
