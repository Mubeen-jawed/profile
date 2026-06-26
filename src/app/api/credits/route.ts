import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

const ANON_LIMIT = 1;

export async function GET(request: NextRequest) {
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
      redditUsername: user.redditUsername ?? null,
      redditConnected: Boolean(user.redditUsername),
    });
  }

  // Anonymous — check both session cookie and IP
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const cookieStore = await cookies();
  const sid = cookieStore.get("ttp_anon_sid")?.value;

  const [anonBySid, anonByIp] = await Promise.all([
    sid ? prisma.anonCredit.findUnique({ where: { sessionId: sid } }) : Promise.resolve(null),
    ip !== "unknown"
      ? prisma.anonCredit.findFirst({
          where: { ipAddress: ip, creditsUsed: { gte: ANON_LIMIT } },
        })
      : Promise.resolve(null),
  ]);

  const usedBySession = anonBySid?.creditsUsed ?? 0;
  const blockedByIp = anonByIp != null;

  const credits = blockedByIp || usedBySession >= ANON_LIMIT ? 0 : ANON_LIMIT - usedBySession;

  return NextResponse.json({ credits, isLoggedIn: false, isPaid: false });
}
