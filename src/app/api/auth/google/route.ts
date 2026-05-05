import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthURL } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const appUrl = process.env.APP_URL || request.nextUrl.origin;
  const cfToken = request.nextUrl.searchParams.get("cf_token");

  // Verify Cloudflare Turnstile token
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    if (!cfToken) {
      return NextResponse.redirect(new URL("/signin?error=turnstile_failed", appUrl));
    }

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: turnstileSecret,
        response: cfToken,
      }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return NextResponse.redirect(new URL("/signin?error=turnstile_failed", appUrl));
    }
  }

  const url = getGoogleOAuthURL();
  return NextResponse.redirect(url);
}
