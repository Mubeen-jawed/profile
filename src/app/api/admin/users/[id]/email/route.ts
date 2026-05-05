import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { plainTextToHtml, sendEmail } from "@/lib/email";

const MAX_SUBJECT_LENGTH = 200;
const MAX_BODY_LENGTH = 10000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      subject?: unknown;
      body?: unknown;
    };

    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const messageBody = typeof body.body === "string" ? body.body.trim() : "";

    if (!subject || subject.length > MAX_SUBJECT_LENGTH) {
      return NextResponse.json(
        { error: `Subject is required and must be at most ${MAX_SUBJECT_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (!messageBody || messageBody.length > MAX_BODY_LENGTH) {
      return NextResponse.json(
        { error: `Message body is required and must be at most ${MAX_BODY_LENGTH} characters` },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true, username: true },
    });

    if (!user || !user.email) {
      return NextResponse.json({ error: "User not found or has no email" }, { status: 404 });
    }

    const result = await sendEmail({
      to: user.email,
      subject,
      html: plainTextToHtml(messageBody),
      text: messageBody,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    console.error("[admin/users/id/email] POST failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
