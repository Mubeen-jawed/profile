import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | redditprofile",
  description:
    "Privacy Policy for redditprofile. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mb-10 text-sm text-zinc-500">
        Last updated: April 18, 2026
      </p>

      <div className="prose-sm space-y-8 text-zinc-300">
        <Section title="1. Introduction">
          <p>
            This Privacy Policy describes how redditprofile (&quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;) collects, uses, and handles
            your information when you use redditprofile.com (the
            &quot;Service&quot;).
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <h3 className="text-sm font-semibold text-foreground">
            2.1 Account Information
          </h3>
          <p>
            When you create an account using Google OAuth, we receive and store
            your name, email address, and Google profile picture. We do not
            receive or store your Google password.
          </p>

          <h3 className="text-sm font-semibold text-foreground">
            2.2 Usage Data
          </h3>
          <p>
            We collect information about how you use the Service, including
            search queries (Reddit usernames you look up), search timestamps,
            and the number of results returned. This data is used to provide the
            search history feature and to improve the Service.
          </p>

          <h3 className="text-sm font-semibold text-foreground">
            2.3 Payment Information
          </h3>
          <p>
            When you make a purchase, payment information such as credit card
            numbers is processed by our third-party payment processor. We do not
            store your full credit card number or payment credentials on our
            servers.
          </p>

          <h3 className="text-sm font-semibold text-foreground">
            2.4 Automatically Collected Data
          </h3>
          <p>
            We may automatically collect certain technical information including
            your IP address, browser type, operating system, and referring URLs.
            This data is used for security, analytics, and service improvement.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>Provide, operate, and maintain the Service</li>
            <li>Process transactions and manage your account</li>
            <li>Display your search history for your convenience</li>
            <li>Improve and personalize your experience</li>
            <li>Communicate with you about your account or the Service</li>
            <li>Detect, prevent, and address technical issues and abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </Section>

        <Section title="4. Data We Display">
          <p>
            The Reddit data displayed through search results, including posts,
            comments, subreddits, scores, timestamps, and permalinks, is
            publicly available information from Reddit. We aggregate and display
            this public data but do not claim ownership of it. We do not access,
            store, or display any private Reddit data.
          </p>
        </Section>

        <Section title="5. Data Sharing and Disclosure">
          <p>
            We do not sell your personal information. We may share your
            information only in the following circumstances:
          </p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              <strong className="text-zinc-300">Payment processing:</strong> We
              share necessary transaction data with our payment processor to
              complete purchases.
            </li>
            <li>
              <strong className="text-zinc-300">Legal compliance:</strong> We
              may disclose information if required by law, regulation, legal
              process, or governmental request.
            </li>
            <li>
              <strong className="text-zinc-300">Protection of rights:</strong>{" "}
              We may disclose information to protect the rights, property, or
              safety of redditprofile, our users, or the public.
            </li>
          </ul>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain your account information for as long as your account is
            active or as needed to provide the Service. Search history is
            retained to support the search history feature. You may request
            deletion of your account and associated data by contacting us.
          </p>
        </Section>

        <Section title="7. Data Security">
          <p>
            We use technical and organizational measures to protect your
            personal information. No method of transmission over the internet or
            electronic storage is 100% secure, and we cannot guarantee absolute
            security.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            We use essential cookies to maintain your authenticated session. We
            do not use tracking cookies for advertising. All data transmission
            uses HTTPS encryption.
          </p>
        </Section>

        <Section title="9. Third-Party Services">
          <p>Our Service integrates with the following third-party services:</p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              <strong className="text-zinc-300">Google OAuth:</strong> For
              account authentication, subject to Google&apos;s Privacy Policy.
            </li>
            <li>
              <strong className="text-zinc-300">Payment Processor:</strong> For
              processing payments, subject to their privacy policy.
            </li>
            <li>
              <strong className="text-zinc-300">Cloudflare:</strong> For
              security and performance, subject to Cloudflare&apos;s Privacy
              Policy.
            </li>
          </ul>
        </Section>

        <Section title="10. Your Rights">
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Data portability</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:support@redditprofile.com"
              className="text-green-accent hover:underline"
            >
              support@redditprofile.com
            </a>
            .
          </p>
        </Section>

        <Section title="11. Children's Privacy">
          <p>
            The Service is not intended for users under the age of 13. We do not
            knowingly collect personal information from children under 13. If we
            become aware that we have collected data from a child under 13, we
            will take steps to delete that information.
          </p>
        </Section>

        <Section title="12. International Users">
          <p>
            If you access the Service from outside the country where our servers
            are located, your information may be transferred to, stored, and
            processed in a different jurisdiction. By using the Service, you
            consent to such transfer.
          </p>
        </Section>

        <Section title="13. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Updates will be
            posted on this page with a revised &quot;Last updated&quot; date. We
            encourage you to review this page periodically.
          </p>
        </Section>

        <Section title="14. Contact Us">
          <p>
            If you have questions or concerns about this Privacy Policy, contact
            us at:{" "}
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
