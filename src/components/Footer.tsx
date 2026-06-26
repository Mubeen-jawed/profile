"use client";

import Image from "next/image";

export default function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="site-footer">
      <div className="footer-accent-bar" aria-hidden="true" />

      <div className="footer-inner">
        <div className="footer-brand">
          <a href="/" className="logo footer-logo">
            <Image
              src="/logo.png"
              alt="redditprofile"
              width={200}
              height={200}
              className="logo-img"
            />
          </a>
          <p className="footer-tagline">
            Analytics &amp; backup for your own Reddit account
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          <p className="footer-col-heading">Product</p>
          <button className="footer-link" onClick={() => scrollTo("features")}>
            Features
          </button>
          <button className="footer-link" onClick={() => scrollTo("use-cases")}>
            Use Cases
          </button>
          <a href="/pricing" className="footer-link">
            Pricing
          </a>
        </nav>

        <nav className="footer-nav" aria-label="Legal">
          <p className="footer-col-heading">Legal</p>
          <a href="/terms" className="footer-link">
            Terms of Service
          </a>
          <a href="/privacy" className="footer-link">
            Privacy Policy
          </a>
          <a href="/refund-policy" className="footer-link">
            Refund Policy
          </a>
        </nav>

        <nav className="footer-nav" aria-label="Support">
          <p className="footer-col-heading">Support</p>
          <a href="/contact" className="footer-link">
            Contact
          </a>
          <a href="mailto:support@redditprofile.com" className="footer-link">
            support@redditprofile.com
          </a>
        </nav>
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">
          © {new Date().getFullYear()}{" "}
          <span className="gr footer-brand-name">redditprofile</span>. All
          rights reserved. Not affiliated with or endorsed by Reddit, Inc.
        </span>
        <div className="footer-bottom-links">
          <a href="/privacy" className="footer-bottom-link">
            Privacy
          </a>
          <span className="footer-sep" aria-hidden="true">
            ·
          </span>
          <a href="/terms" className="footer-bottom-link">
            Terms
          </a>
          <span className="footer-sep" aria-hidden="true">
            ·
          </span>
          <a href="/refund-policy" className="footer-bottom-link">
            Refunds
          </a>
        </div>
      </div>
    </footer>
  );
}
