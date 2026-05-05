import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { avatarUrl: true },
  });

  return NextResponse.json({
    user: {
      userId: session.userId,
      email: session.email,
      username: session.username,
      role: session.role,
      avatarUrl: user?.avatarUrl ?? null,
    },
  });
}
