import LandingSearchForm from "@/components/LandingSearchForm";
import useCases1 from "../../public/use-cases-1.png";
// import useCases2 from "../../public/use-cases-2.png";
// import useCases3 from "../../public/use-cases-3.png";

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-glow2" aria-hidden="true" />

        <h1>
          Discover any
          <br />
          <span className="gr">Reddit Profile</span>
        </h1>

        <p className="sub">
          Search Your Next Prospect, Friend or Potential Partner in seconds.
        </p>

        <LandingSearchForm />

        <div className="promo-banner mt-6">
          <svg
            className="h-3.5 w-3.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          lifetime access, for the first 30 users only
        </div>
      </section>

      {/* ── Features ── */}
      <div className="section-divider" />
      <section id="features" className="landing-section features-section">
        <h2 className="section-heading">Know anyone on Reddit in seconds</h2>
        <p className="section-subtext">
          Type a username and see their karma breakdown, post history, and
          account details, all from public Reddit data.
        </p>

        <div className="features-bento">
          <div className="feat-card feat-lg feat-accent-blue">
            <span className="feat-sys-id" aria-hidden="true">
              SYS.KARMA
            </span>
            <div className="feat-icon feat-icon-blue">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <h3 className="feat-name">All 4 karma types, broken down</h3>
            <p className="feat-text">
              Total karma, post karma, comment karma, and awardee karma, each
              shown separately so you can see exactly where their score comes
              from.
            </p>
            <div className="feat-tracks" aria-hidden="true">
              <div className="feat-track">
                <span className="feat-track-label">Post karma</span>
                <div className="feat-track-bar">
                  <div
                    className="feat-track-fill"
                    style={{ width: "80%", background: "var(--red)" }}
                  />
                </div>
              </div>
              <div className="feat-track">
                <span className="feat-track-label">Comment karma</span>
                <div className="feat-track-bar">
                  <div
                    className="feat-track-fill"
                    style={{ width: "55%", background: "#60a5fa" }}
                  />
                </div>
              </div>
              <div className="feat-track">
                <span className="feat-track-label">Awardee karma</span>
                <div className="feat-track-bar">
                  <div
                    className="feat-track-fill"
                    style={{ width: "30%", background: "#22c55e" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="feat-card feat-accent-red">
            <span className="feat-sys-id" aria-hidden="true">
              SYS.HIST
            </span>
            <div className="feat-icon feat-icon-red">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="feat-name">Posts and comments, both</h3>
            <p className="feat-text">
              Switch between their post history and comment history in one view.
              See the subreddit, score, and date for each entry.
            </p>
          </div>

          <div className="feat-card feat-accent-green">
            <span className="feat-sys-id" aria-hidden="true">
              SYS.ACCT
            </span>
            <div className="feat-icon feat-icon-green">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="feat-name">Account age at a glance</h3>
            <p className="feat-text">
              See when the account was created, how old it is, and how many
              followers it has, useful for spotting brand-new accounts.
            </p>
          </div>

          <div className="feat-card feat-half feat-accent-gold">
            <span className="feat-sys-id" aria-hidden="true">
              SYS.LINK
            </span>
            <div className="feat-icon feat-icon-gold">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <h3 className="feat-name">Share any search with a link</h3>
            <p className="feat-text">
              Every search has its own URL. Send it to anyone, no setup needed.
            </p>
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <div className="section-divider" />
      <section id="use-cases" className="landing-section use-cases-section">
        <div className="uc-deco" aria-hidden="true">
          <svg
            viewBox="0 0 80 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="58"
            height="42"
          >
            <path
              d="M62 6 C48 6, 26 16, 20 44"
              stroke="rgba(255,69,0,0.38)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M14 39 L20 44 L27 41"
              stroke="rgba(255,69,0,0.38)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="section-heading">
          Real reasons <span className="uc-accent">people search</span>
        </h2>
        <p className="section-subtext">
          You don&apos;t always know who you&apos;re dealing with. Here&apos;s
          where a quick lookup{" "}
          <strong className="uc-subtext-em">changes everything.</strong>
        </p>

        <div className="uc-steps-grid">
          {/* Step 1 */}
          <div className="uc-step-card">
            {/* <img src={useCases1} alt="Know who you're dealing with" /> */}
            <div className="uc-step-content">
              <h3 className="uc-step-title">
                Know exactly who you&apos;re dealing with
              </h3>
              <p className="uc-step-desc">
                Before you hire, date, or buy, pull up their Reddit. Account
                age, karma history, and posting patterns tell you whether
                someone&apos;s story holds water.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="uc-step-card">
            {/* <img src={useCases2} alt="Spot red flags with account analysis" /> */}
            <div className="uc-step-content">
              <h3 className="uc-step-title">
                Spot red flags before it&apos;s too late
              </h3>
              <p className="uc-step-desc">
                Brand new account. Zero karma. Too-good-to-be-true offer.
                Surfaces the patterns scammers can&apos;t fake, account age,
                activity, and behavior across every subreddit they&apos;ve
                touched.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="uc-step-card">
            {/* <img
              src={useCases3}
              alt="See who they really are across subreddits"
            /> */}
            <div className="uc-step-content">
              <h3 className="uc-step-title">See who they really are</h3>
              <p className="uc-step-desc">
                What someone posts when no one&apos;s watching says everything.
                See their communities, passions, and opinions, and form a real
                picture before your first conversation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <div className="section-divider" />
      <section id="pricing" className="landing-section pricing-section">
        <h2 className="section-heading">Simple, transparent pricing</h2>
        <p className="section-subtext">
          Start free, upgrade when you need more. No subscriptions, no
          surprises.
        </p>

        <div className="pricing-grid">
          <div className="price-card">
            <div className="price-tier">Free</div>
            <div className="price-amount">
              <sup>$</sup>0
            </div>
            <div className="price-cadence">forever, no card required</div>
            <ul className="price-features">
              {[
                { text: "Full Reddit profile data", on: true },
                { text: "Last 7 recent posts and comments", on: true },
                { text: "Shareable search links", on: true },
                { text: "10 Credits for free", on: true },
                { text: "Search history", on: true },
                { text: "CSV Export", on: false },
                { text: "Unlimited Credits", on: false },
              ].map((f) => (
                <li
                  key={f.text}
                  className={`price-line${f.on ? "" : " price-line-off"}`}
                >
                  <span
                    className={`price-check${f.on ? "" : " price-check-off"}`}
                    aria-hidden="true"
                  >
                    {f.on ? (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                  </span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
            <a href="#search" className="price-cta price-cta-free">
              Start Searching, Free
            </a>
          </div>

          <div className="price-card price-card-pro">
            <div className="price-badge-wrap">
              <span className="price-popular-badge">Best Value</span>
            </div>
            <div className="price-tier">Pro</div>
            <div className="price-amount">
              <sup>$</sup>9
            </div>
            <div className="price-cadence">
              one-time payment, lifetime access
            </div>
            <ul className="price-features">
              {[
                "Everything in Free",
                "Unlimited search credits",
                "All posts and comments",
                "CSV export",
                "Early access to new features",
                "Priority support",
              ].map((f) => (
                <li key={f} className="price-line">
                  <span className="price-check" aria-hidden="true">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a href="/api/checkout" className="price-cta price-cta-pro">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>{" "}
              Get Lifetime Pro Access
            </a>
            <p className="price-guarantee">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{
                  display: "inline",
                  marginRight: "4px",
                  verticalAlign: "middle",
                }}
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Satisfaction guaranteed or full refund
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
