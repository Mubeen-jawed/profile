import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing, redditprofile",
  description:
    "Simple, transparent pricing. Start free or upgrade to Lifetime Pro for $3.99 one-time — unlimited analytics and CSV export for your Reddit account.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-3 text-zinc-400">
          No hidden fees. No subscriptions. Choose the plan that works for you.
        </p>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="promo-banner">
          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          One-time payment &amp; lifetime access — first 30 users only
        </div>
      </div>

      <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
        {/* Free Plan */}
        <div className="rounded-xl border border-card-border bg-card-bg p-6">
          <h2 className="mb-1 text-xl font-bold text-foreground">Free</h2>
          <div className="mb-6">
            <span className="text-3xl font-bold text-foreground">$0</span>
          </div>
          <ul className="mb-6 space-y-3">
            {[
              "Connect your Reddit account",
              "10 analytics refreshes",
              "Preview of your 10 most recent posts & comments",
            ].map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-sm text-zinc-300"
              >
                <svg
                  className="h-4 w-4 flex-shrink-0 text-green-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="block w-full rounded-lg border border-card-border bg-background py-2.5 text-center text-sm font-semibold text-foreground transition-all hover:border-green-accent/30"
          >
            Get Started Free
          </Link>
        </div>

        {/* Lifetime Pro Plan */}
        <div className="rounded-xl border border-green-accent/50 bg-green-accent/5 p-6 shadow-[0_0_30px_rgba(255,69,0,0.1)]">
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-green-accent">
            Best Value
          </div>
          <h2 className="mb-1 text-xl font-bold text-foreground">
            Lifetime Pro
          </h2>
          <div className="mb-6">
            <span className="text-3xl font-bold text-foreground">$3.99</span>
            <span className="text-zinc-500"> one-time</span>
          </div>
          <ul className="mb-6 space-y-3">
            {[
              "Unlimited analytics refreshes",
              "Your full post & comment history",
              "CSV export included",
              "Lifetime access, no subscription ever",
            ].map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-sm text-zinc-300"
              >
                <svg
                  className="h-4 w-4 flex-shrink-0 text-green-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <a
            href="/api/checkout"
            className="block w-full rounded-lg bg-green-accent py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-[#cc3700]"
          >
            Get Lifetime Pro Access
          </a>
        </div>
      </div>

      {/* What's Included */}
      <div className="mt-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
          What&apos;s Included
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <IncludedFeature
            title="Your Karma Breakdown"
            description="Total, post, comment, and awardee karma for your own account, each shown separately."
          />
          <IncludedFeature
            title="Structured Dashboard"
            description="Your posts and comments are separated with subreddit context, scores, timestamps, and direct links."
          />
          <IncludedFeature
            title="CSV Export"
            description="Download your own posts and comments as a CSV file to back up or archive your content."
          />
          <IncludedFeature
            title="Top Communities"
            description="See the subreddits you post in most so you know where your Reddit time actually goes."
          />
          <IncludedFeature
            title="Instant Results"
            description="Your dashboard loads in seconds, with data fetched live from Reddit's public API."
          />
          <IncludedFeature
            title="No Subscription"
            description="The Lifetime Pro plan is a one-time payment. You will never be charged again."
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto max-w-2xl space-y-6">
          <FaqItem
            question="Whose Reddit data does redditprofile show?"
            answer="Only your own. You connect your Reddit account with Reddit's official sign-in, and the dashboard shows analytics for that account. No private messages or non-public data is ever accessed."
          />
          <FaqItem
            question="Is this a subscription?"
            answer="No. The Lifetime Pro plan is a one-time payment of $3.99. You will never be billed again after purchase."
          />
          <FaqItem
            question="Can I get a refund?"
            answer="Yes, we offer refunds within 7 days of purchase if you are not satisfied. See our refund policy for details."
          />
          <FaqItem
            question="Do I need an account?"
            answer="Yes. You sign in and connect your Reddit account so we can show your analytics. A free account includes 10 analytics refreshes."
          />
          <FaqItem
            question="What payment methods are accepted?"
            answer="We accept all major credit and debit cards and other methods supported by our payment provider. Payments are processed securely by Polar, our Merchant of Record."
          />
          <FaqItem
            question="Who processes my payment?"
            answer="All purchases are processed by Polar (polar.sh), which acts as the Merchant of Record. Polar handles billing and any applicable sales tax or VAT, and the charge appears on your statement under our Polar descriptor."
          />
        </div>
      </div>

      <p className="mt-12 text-center text-sm text-zinc-500">
        Questions?{" "}
        <Link href="/contact" className="text-green-accent hover:underline">
          Contact us
        </Link>{" "}
        , we&apos;re happy to help.
      </p>
    </div>
  );
}

function IncludedFeature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-5">
      <h3 className="mb-1 text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-5">
      <h3 className="mb-2 text-sm font-semibold text-foreground">{question}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{answer}</p>
    </div>
  );
}
