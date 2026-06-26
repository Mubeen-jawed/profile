import { NextRequest, NextResponse } from "next/server";
import { getSession, getRedditOAuthURL } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

// Starts the "connect your Reddit account" flow. Requires the user to be
// signed in first — the callback links the verified Reddit identity to their
// existing account so the app only ever analyzes their own account.
export async function GET(request: NextRequest) {
  const appUrl = process.env.APP_URL || request.nextUrl.origin;

  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const { allowed } = rateLimit(`reddit-auth:${ip}`, 20, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.redirect(new URL("/signin?error=rate_limit", appUrl));
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(
      new URL("/signin?redirect=/account", appUrl),
    );
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(getRedditOAuthURL(state));
  response.cookies.set("ttp_reddit_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });
  return response;
}
