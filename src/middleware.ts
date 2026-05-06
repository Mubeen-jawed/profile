import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET environment variable is required in production",
    );
  }
  return new TextEncoder().encode(
    secret || "dev-only-secret-not-for-production",
  );
}

const ADMIN_SECRET = getJwtSecret();

function getClientIp(request: NextRequest): string {
  // Prefer Cloudflare header (cannot be spoofed when behind CF)
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Attach client IP as a header for downstream route handlers
  response.headers.set("x-client-ip", getClientIp(request));

  // CSRF protection for state-changing requests on admin API routes
  if (
    pathname.startsWith("/api/admin/") &&
    !pathname.startsWith("/api/admin/auth") &&
    ["POST", "PATCH", "PUT", "DELETE"].includes(request.method)
  ) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { error: "CSRF: origin mismatch" },
            { status: 403 },
          );
        }
      } catch {
        return NextResponse.json(
          { error: "CSRF: invalid origin" },
          { status: 403 },
        );
      }
    }
  }

  // Protect admin API endpoints (enforce auth at middleware level)
  if (
    pathname.startsWith("/api/admin/") &&
    !pathname.startsWith("/api/admin/auth")
  ) {
    const token = request.cookies.get("ttp_admin")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
      const { payload } = await jwtVerify(token, ADMIN_SECRET);
      if (payload.admin !== true) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  // Protect /abba pages, let the page show a login form if not authenticated
  if (pathname.startsWith("/abba") && !pathname.startsWith("/api/")) {
    const token = request.cookies.get("ttp_admin")?.value;
    if (!token) {
      return response;
    }

    try {
      const { payload } = await jwtVerify(token, ADMIN_SECRET);
      if (payload.admin !== true) {
        return response;
      }
    } catch {
      return response;
    }
  }

  return response;
}

export const config = {
  matcher: ["/abba/:path*", "/api/admin/:path*"],
};
