import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | redditprofile",
  description:
    "Get in touch with the redditprofile team for support, billing, refunds, or privacy requests.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
        Contact Us
      </h1>
      <p className="mb-10 text-sm text-zinc-500">
        We&apos;re a small team and we read every message. Most replies go out
        within 1–2 business days.
      </p>

      <div className="prose-sm space-y-8 text-zinc-300">
        <Section title="Support & General Enquiries">
          <p>
            For help with the product, your account, or anything else, email us
            at{" "}
            <a
              href="mailto:support@redditprofile.com"
              className="text-green-accent hover:underline"
            >
              support@redditprofile.com
            </a>
            . We aim to respond within 1–2 business days (Monday to Friday).
          </p>
        </Section>

        <Section title="Billing & Refunds">
          <p>
            Questions about a charge, or want to request a refund on the
            Lifetime Pro plan? Email{" "}
            <a
              href="mailto:support@redditprofile.com"
              className="text-green-accent hover:underline"
            >
              support@redditprofile.com
            </a>{" "}
            with your account email and the date of purchase. See our{" "}
            <Link
              href="/refund-policy"
              className="text-green-accent hover:underline"
            >
              Refund Policy
            </Link>{" "}
            for full details.
          </p>
        </Section>

        <Section title="Privacy & Data Requests">
          <p>
            To access, correct, or delete the personal data we hold about you,
            email{" "}
            <a
              href="mailto:support@redditprofile.com"
              className="text-green-accent hover:underline"
            >
              support@redditprofile.com
            </a>{" "}
            with the subject line &quot;Privacy Request&quot;. Our{" "}
            <Link href="/privacy" className="text-green-accent hover:underline">
              Privacy Policy
            </Link>{" "}
            explains your rights in full.
          </p>
        </Section>

        <Section title="Payments & Merchant of Record">
          <p>
            Payments on redditprofile are processed by{" "}
            <strong className="text-zinc-300">Polar</strong> (polar.sh), which
            acts as the Merchant of Record for all purchases. Polar handles
            payment processing, billing, and any applicable sales tax or VAT on
            our behalf. Charges appear on your statement under our Polar
            descriptor. Your purchase is also subject to Polar&apos;s own terms
            and privacy policy.
          </p>
        </Section>

        <Section title="Business Information">
          <p>
            redditprofile is operated as a sole proprietorship. For formal or
            legal correspondence, please reach us first at{" "}
            <a
              href="mailto:support@redditprofile.com"
              className="text-green-accent hover:underline"
            >
              support@redditprofile.com
            </a>{" "}
            and we will provide the relevant details.
          </p>
        </Section>
      </div>

      <div className="mt-12 rounded-xl border border-card-border bg-card-bg p-5 text-center">
        <p className="text-sm text-zinc-400">
          See also our{" "}
          <Link href="/terms" className="text-green-accent hover:underline">
            Terms of Service
          </Link>
          ,{" "}
          <Link href="/privacy" className="text-green-accent hover:underline">
            Privacy Policy
          </Link>
          , and{" "}
          <Link
            href="/refund-policy"
            className="text-green-accent hover:underline"
          >
            Refund Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-zinc-400">
        {children}
      </div>
    </section>
  );
}
