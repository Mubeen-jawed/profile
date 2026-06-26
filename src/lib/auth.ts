import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  return new TextEncoder().encode(secret || "dev-only-secret-not-for-production");
}

const JWT_SECRET = getJwtSecret();

const COOKIE_NAME = "ttp_session";

export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
}

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function getGoogleOAuthURL() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL || "http://localhost:3000"}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// ── Reddit OAuth ────────────────────────────────────────────────────────────
// Used to verify a user owns the Reddit account they want to analyze. We only
// request the "identity" scope (read the username of the authenticated user);
// the app never reads or acts on behalf of the account beyond confirming it.
function getRedditRedirectUri() {
  return `${process.env.APP_URL || "http://localhost:3000"}/api/auth/reddit/callback`;
}

export function getRedditOAuthURL(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.REDDIT_CLIENT_ID!,
    response_type: "code",
    state,
    redirect_uri: getRedditRedirectUri(),
    duration: "temporary",
    scope: "identity",
  });

  return `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
}

export async function exchangeRedditCode(code: string) {
  const basic = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`,
  ).toString("base64");

  const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "redditprofile/1.0",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedditRedirectUri(),
    }),
  });

  if (!tokenRes.ok) {
    throw new Error("Failed to exchange Reddit auth code");
  }

  const tokens = await tokenRes.json();

  const meRes = await fetch("https://oauth.reddit.com/api/v1/me", {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "User-Agent": "redditprofile/1.0",
    },
  });

  if (!meRes.ok) {
    throw new Error("Failed to fetch Reddit identity");
  }

  return meRes.json() as Promise<{ id: string; name: string }>;
}

export async function exchangeGoogleCode(code: string) {
  const redirectUri = `${process.env.APP_URL || "http://localhost:3000"}/api/auth/google/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    throw new Error("Failed to exchange Google auth code");
  }

  const tokens = await tokenRes.json();

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return userRes.json() as Promise<{
    id: string;
    email: string;
    name: string;
    picture: string;
  }>;
}
