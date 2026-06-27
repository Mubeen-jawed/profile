import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

const ANON_LIMIT = 1;

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

  // Anonymous — gate on the per-session cookie only. IP-based blocking is
  // intentionally avoided here because shared public IPs (carrier/corporate
  // NAT, proxies/CDNs) falsely report first-time visitors as out of credits.
  // Must mirror the gating logic in /api/search.
  const cookieStore = await cookies();
  const sid = cookieStore.get("ttp_anon_sid")?.value;

  const anonBySid = sid
    ? await prisma.anonCredit.findUnique({ where: { sessionId: sid } })
    : null;

  const usedBySession = anonBySid?.creditsUsed ?? 0;

  const credits = usedBySession >= ANON_LIMIT ? 0 : ANON_LIMIT - usedBySession;

  return NextResponse.json({ credits, isLoggedIn: false, isPaid: false });
}
