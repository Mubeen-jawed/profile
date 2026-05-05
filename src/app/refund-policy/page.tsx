import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | redditprofile",
  description:
    "Refund Policy for redditprofile. Learn about our 7-day money-back guarantee.",
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
        Refund Policy
      </h1>
      <p className="mb-10 text-sm text-zinc-500">
        Last updated: April 18, 2026
      </p>

      <div className="prose-sm space-y-8 text-zinc-300">
        <Section title="Overview">
          <p>
            If you are not satisfied with the Lifetime Pro plan, you may request
            a refund within the window described below.
          </p>
        </Section>

        <Section title="7-Day Money-Back Guarantee">
          <p>
            We offer a{" "}
            <strong className="text-foreground">
              7-day money-back guarantee
            </strong>{" "}
            on all Lifetime Pro purchases. If you are not satisfied with the
            Service for any reason, you may request a full refund within 7
            calendar days of your purchase date.
          </p>
        </Section>

        <Section title="How to Request a Refund">
          <p>
            To request a refund, contact us using one of the following methods:
          </p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              <strong className="text-zinc-300">Email:</strong>{" "}
              <a
                href="mailto:support@redditprofile.com"
                className="text-green-accent hover:underline"
              >
                support@redditprofile.com
              </a>
            </li>
          </ul>
          <p>
            Please include your account email address and the date of purchase.
            We will process your refund within 5 to 10 business days of
            receiving your request.
          </p>
        </Section>

        <Section title="Refund Conditions">
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              Refund requests must be submitted within 7 calendar days of the
              original purchase date.
            </li>
            <li>
              Refunds are issued to the original payment method used for the
              purchase.
            </li>
            <li>
              Upon refund, your account will revert to the free tier and you
              will lose access to Lifetime Pro features.
            </li>
            <li>
              Each customer is eligible for one refund. Repeated purchases
              followed by refund requests may be declined.
            </li>
          </ul>
        </Section>

        <Section title="Non-Refundable Items">
          <p>
            The free tier of redditprofile does not involve any payment and is
            not subject to this refund policy. This policy applies exclusively
            to the paid Lifetime Pro plan.
          </p>
        </Section>

        <Section title="Processing Time">
          <p>
            Once your refund request is approved, it may take 5 to 10 business
            days for the refund to appear on your statement, depending on your
            payment provider and financial institution.
          </p>
        </Section>

        <Section title="Exceptions">
          <p>
            We reserve the right to decline refund requests in cases of
            suspected fraud, abuse, or violation of our{" "}
            <Link href="/terms" className="text-green-accent hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </Section>

        <Section title="Contact Us">
          <p>
            If you have questions about this refund policy, contact us at:{" "}
            <a
              href="mailto:support@redditprofile.com"
              className="text-green-accent hover:underline"
            >
              support@redditprofile.com
            </a>
          </p>
        </Section>
      </div>

      <div className="mt-12 rounded-xl border border-card-border bg-card-bg p-5 text-center">
        <p className="text-sm text-zinc-400">
          See also our{" "}
          <Link href="/terms" className="text-green-accent hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-green-accent hover:underline">
            Privacy Policy
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
