"use client";

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
            <span className="logo-wordmark">
              Reddit<span style={{ color: "var(--red)" }}>Profile</span>
            </span>
          </a>
          <p className="footer-tagline">
            Instant intelligence on any Reddit user
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
          <button className="footer-link" onClick={() => scrollTo("pricing")}>
            Pricing
          </button>
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
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">
          © {new Date().getFullYear()}{" "}
          <span className="gr footer-brand-name">redditprofile</span>. All
          rights reserved.
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
