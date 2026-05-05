import { jwtVerify } from "jose";
import { cookies } from "next/headers";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  return new TextEncoder().encode(secret || "dev-only-secret-not-for-production");
}

const ADMIN_SECRET = getJwtSecret();

const COOKIE_NAME = "ttp_admin";

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, ADMIN_SECRET);
    return payload.admin === true;
  } catch {
    return false;
  }
}
