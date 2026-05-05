import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode, createToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sendNewUserNotification } from "@/lib/email";

export async function GET(request: NextRequest) {
  const appUrl = process.env.APP_URL || request.nextUrl.origin;

  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed } = rateLimit(`google-auth:${ip}`, 20, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.redirect(new URL("/signin?error=rate_limit", appUrl));
  }

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/signin?error=google_denied", appUrl));
  }

  try {
    const googleUser = await exchangeGoogleCode(code);

    // Find existing user by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.id },
          { email: googleUser.email.toLowerCase() },
        ],
      },
    });

    if (user) {
      // Link Google account if not already linked
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            avatarUrl: googleUser.picture,
          },
        });
      }
    } else {
      // Create new user
      // Generate a unique username from Google name
      const baseName = googleUser.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20) || "user";
      let username = baseName;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseName}${counter}`;
        counter++;
      }

      user = await prisma.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          username,
          googleId: googleUser.id,
          avatarUrl: googleUser.picture,
        },
      });

      // Send admin notification (non-blocking)
      sendNewUserNotification({ email: user.email, username: user.username }).catch(() => {});
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const appUrl = process.env.APP_URL || request.nextUrl.origin;
    const response = NextResponse.redirect(new URL("/", appUrl));
    response.cookies.set("ttp_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    const appUrl = process.env.APP_URL || request.nextUrl.origin;
    return NextResponse.redirect(new URL("/signin?error=google_failed", appUrl));
  }
}
