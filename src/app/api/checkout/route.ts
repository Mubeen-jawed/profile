import { NextRequest, NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const appUrl = process.env.APP_URL || request.nextUrl.origin;

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/signin?redirect=/checkout", appUrl));
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return NextResponse.redirect(new URL("/signin", appUrl));
  }

  if (user.isPaid) {
    // Already paid, just send them back to search
    return NextResponse.redirect(new URL("/search", appUrl));
  }

  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  const productId = process.env.POLAR_PRODUCT_ID;

  if (!accessToken || !productId) {
    return NextResponse.json(
      { error: "Payment is not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  const polar = new Polar({
    accessToken,
    server: (process.env.POLAR_SERVER as "sandbox") || undefined,
  });

  try {
    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${appUrl}/payment/success?checkoutId={CHECKOUT_ID}`,
      customerEmail: user.email,
      externalCustomerId: user.id,
      metadata: { userId: user.id },
    });

    return NextResponse.redirect(checkout.url);
  } catch (err) {
    console.error("Polar checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 },
    );
  }
}
