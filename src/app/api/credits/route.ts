import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  const session = await getSession();

  if (session) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ credits: 0, isLoggedIn: false, isPaid: false });

    const isPaid = user.isPaid || user.role === "admin";
    return NextResponse.json({
      credits: isPaid ? -1 : user.searchCredits,
      isLoggedIn: true,
      isPaid,
      role: user.role,
    });
  }

  // Anonymous
  const cookieStore = await cookies();
  const sid = cookieStore.get("ttp_anon_sid")?.value;
  if (!sid) {
    return NextResponse.json({ credits: 1, isLoggedIn: false, isPaid: false });
  }

  const anon = await prisma.anonCredit.findUnique({ where: { sessionId: sid } });
  const used = anon?.creditsUsed ?? 0;
  return NextResponse.json({
    credits: Math.max(0, 1 - used),
    isLoggedIn: false,
    isPaid: false,
  });
}
