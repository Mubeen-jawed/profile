import { NextRequest, NextResponse } from "next/server";
import { getSession, exchangeRedditCode, createToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const appUrl = process.env.APP_URL || request.nextUrl.origin;

  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const { allowed } = rateLimit(`reddit-cb:${ip}`, 20, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.redirect(new URL("/signin?error=rate_limit", appUrl));
  }

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get("ttp_reddit_state")?.value;

  if (error || !code) {
    return NextResponse.redirect(new URL("/account?reddit=denied", appUrl));
  }
  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/account?reddit=badstate", appUrl));
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/signin?redirect=/account", appUrl));
  }

  try {
    const redditUser = await exchangeRedditCode(code);

    // A given Reddit account can only be linked to one app account.
    const existing = await prisma.user.findUnique({
      where: { redditId: redditUser.id },
    });
    if (existing && existing.id !== session.userId) {
      return NextResponse.redirect(new URL("/account?reddit=inuse", appUrl));
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        redditId: redditUser.id,
        redditUsername: redditUser.name,
      },
    });

    // Refresh the session token so it carries the linked username going forward.
    const token = await createToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.redirect(new URL("/account?reddit=ok", appUrl));
    response.cookies.set("ttp_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.delete("ttp_reddit_state");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/account?reddit=failed", appUrl));
  }
}
