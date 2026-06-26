"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

interface AuthUser {
  userId: string;
  email: string;
  username: string;
  role: string;
  avatarUrl?: string;
}

export default function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (dropdownOpen && user) {
      fetch("/api/credits")
        .then((r) => r.json())
        .then((data) => setCredits(data.credits))
        .catch(() => {});
    }
  }, [dropdownOpen, user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    setDropdownOpen(false);
    window.location.href = "/";
  };

  const handleHomeClick = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePricingClick = () => {
    if (pathname === "/") {
      scrollTo("pricing");
    } else {
      router.push("/#pricing");
    }
  };

  return (
    <div className="nav-shell">
      <header className={scrolled ? "nav-scrolled" : ""}>
        <a href="/" className="logo">
          <Image
            src="/logo.png"
            alt="redditprofile"
            width={200}
            height={200}
            className="logo-img"
            priority
          />
          {/* <span className="logo-wordmark">
            Reddit<span style={{ color: "var(--red)" }}>Profile</span>
          </span> */}
        </a>

        <nav className="nav-links" aria-label="Main">
          <button className="nav-link" onClick={handleHomeClick}>
            Home
          </button>
          <button className="nav-link" onClick={() => scrollTo("features")}>
            Features
          </button>
          <button className="nav-link" onClick={handlePricingClick}>
            Pricing
          </button>
        </nav>

        <div className="nav-ctas">
          {user ? (
            <div className="nav-user-wrap" ref={dropdownRef}>
              <button
                className="nav-user-btn"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-label="Account menu"
                aria-expanded={dropdownOpen}
              >
                <span className="nav-avatar-fallback">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    (user.username[0]?.toUpperCase() ?? "?")
                  )}
                </span>
                <span className="nav-user-name">{user.username}</span>
                <ChevronIcon open={dropdownOpen} />
              </button>

              {dropdownOpen && (
                <div className="nav-dropdown" role="menu">
                  {/* User identity row */}
                  <div className="nav-dropdown-user">
                    <div className="nav-dropdown-avatar">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        (user.username[0]?.toUpperCase() ?? "?")
                      )}
                    </div>
                    <div className="nav-dropdown-user-info">
                      <p className="nav-dropdown-name">{user.username}</p>
                      <p className="nav-dropdown-email">{user.email}</p>
                    </div>
                    {credits !== null && (
                      <div
                        className={`nav-dropdown-credits${credits === -1 ? " nav-dropdown-credits-pro" : ""}`}
                      >
                        {credits === -1 ? "PRO" : `${credits} left`}
                      </div>
                    )}
                  </div>

                  <div className="nav-dropdown-divider" />

                  <a
                    href="/search"
                    className="nav-dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <HistoryIcon />
                    My analytics
                  </a>

                  <a
                    href="/account"
                    className="nav-dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserIcon />
                    Account
                  </a>

                  <button
                    className="nav-dropdown-item nav-dropdown-signout"
                    role="menuitem"
                    onClick={handleSignOut}
                  >
                    <SignOutIcon />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a href="/signin" className="nav-signin">
                Sign In
              </a>
              <a href="/signup" className="nav-signup">
                Get Started
              </a>
            </>
          )}
        </div>
      </header>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transition: "transform 180ms",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
