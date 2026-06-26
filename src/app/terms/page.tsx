import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | redditprofile",
  description:
    "Terms of Service for redditprofile, the Reddit profile tracking tool.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mb-10 text-sm text-zinc-500">
        Last updated: April 18, 2026
      </p>

      <div className="prose-sm space-y-8 text-zinc-300">
        <Section title="1. Introduction">
          <p>
            These Terms of Service govern your use of redditprofile.com (the
            &quot;Service&quot;), operated by redditprofile (&quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;). By using the Service, you agree
            to these Terms. If you do not agree, do not use the Service.
          </p>
        </Section>

        <Section title="2. Description of the Service">
          <p>
            redditprofile is a personal analytics and data-export tool. After
            you connect your own Reddit account using Reddit&apos;s official
            OAuth sign-in, the Service displays analytics for that account —
            your karma breakdown, your public posts and comments, your
            most-active communities — and lets you export them to CSV.
          </p>
          <p>
            The Service only analyzes the Reddit account you have connected and
            verified as your own. It does not access private messages, deleted
            content, or any data that requires authentication beyond confirming
            your identity.
          </p>
        </Section>

        <Section title="3. Acceptable Use">
          <p>
            You agree to use the Service only for lawful purposes. You may not
            use the Service to:
          </p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>Harass, stalk, threaten, or intimidate any person</li>
            <li>
              Conduct unsolicited outreach, spam, or mass messaging campaigns
            </li>
            <li>
              Scrape, redistribute, or resell data obtained through the Service
            </li>
            <li>
              Violate any applicable local, state, national, or international
              law or regulation
            </li>
            <li>
              Infringe on any third party&apos;s intellectual property rights
            </li>
            <li>
              Attempt unauthorized access to any part of the Service or its
              systems
            </li>
            <li>
              Use automated bots, scripts, or tools to access the Service
              without our written consent
            </li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these Terms at our sole discretion, without refund.
          </p>
        </Section>

        <Section title="4. User Accounts">
          <p>
            To access certain features, you may create an account using Google
            OAuth. You are responsible for maintaining the confidentiality of
            your account and for all activity that occurs under it. Notify us
            immediately of any unauthorized use.
          </p>
        </Section>

        <Section title="5. Payments and Billing">
          <p>
            redditprofile offers a free tier with limited searches and a paid
            Lifetime Pro plan for a one-time payment of $3.99 (USD). The Lifetime
            Pro plan grants unlimited access to full search results with no
            recurring charges.
          </p>
          <p>
            Payments are processed by Polar (polar.sh), which acts as the
            Merchant of Record for all purchases. Polar handles payment
            processing, billing, and any applicable sales tax or VAT on our
            behalf, and the charge will appear on your statement under our Polar
            descriptor. By making a purchase, you also agree to Polar&apos;s
            terms and conditions. Prices are subject to change, but changes do
            not affect previously completed purchases.
          </p>
        </Section>

        <Section title="6. Refunds">
          <p>
            We offer a 7-day refund policy for the Lifetime Pro plan. If you are
            not satisfied with your purchase, you may request a full refund
            within 7 days of payment. See our{" "}
            <Link
              href="/refund-policy"
              className="text-green-accent hover:underline"
            >
              Refund Policy
            </Link>{" "}
            for details.
          </p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>
            All content, design, code, and other materials on redditprofile.com
            are owned by redditprofile or its licensors and are protected by
            applicable intellectual property laws. You may not copy, modify,
            distribute, or reproduce any part of the Service without our written
            permission.
          </p>
          <p>
            Reddit content displayed through the Service remains the property of
            Reddit and its respective authors. redditprofile does not claim
            ownership of any Reddit content.
          </p>
        </Section>

        <Section title="8. Disclaimer of Warranties">
          <p>
            The Service is provided &quot;as is&quot; and &quot;as
            available&quot; without warranties of any kind, express or implied.
            We do not guarantee the accuracy, completeness, or timeliness of the
            data displayed. Public Reddit data may be modified or deleted by its
            authors at any time.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, redditprofile and its
            owners, officers, employees, and agents will not be liable for any
            indirect, incidental, special, consequential, or punitive damages
            arising from your use of the Service.
          </p>
        </Section>

        <Section title="10. Privacy">
          <p>
            Your use of the Service is also governed by our{" "}
            <Link href="/privacy" className="text-green-accent hover:underline">
              Privacy Policy
            </Link>
            , which describes how we collect, use, and protect your personal
            information.
          </p>
        </Section>

        <Section title="11. Changes to These Terms">
          <p>
            We may update these Terms from time to time. Material changes will
            be posted on this page with a revised &quot;Last updated&quot; date.
            Continued use of the Service after changes constitutes acceptance of
            the updated Terms.
          </p>
        </Section>

        <Section title="12. Termination">
          <p>
            We may terminate or suspend your access to the Service at any time,
            with or without cause or notice. Upon termination, your right to use
            the Service ends immediately.
          </p>
        </Section>

        <Section title="13. Governing Law">
          <p>
            These Terms are governed by the laws of the jurisdiction in which
            redditprofile operates, without regard to conflict of law
            provisions.
          </p>
        </Section>

        <Section title="14. Contact Us">
          <p>
            If you have questions about these Terms, contact us at:{" "}
            <a
              href="mailto:support@redditprofile.com"
              className="text-green-accent hover:underline"
            >
              support@redditprofile.com
            </a>
          </p>
        </Section>
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
