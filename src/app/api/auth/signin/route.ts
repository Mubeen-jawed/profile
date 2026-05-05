import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Email/password sign-in is no longer supported. Please use Google sign-in." },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.redirect(new URL("/api/auth/google"));
}
