"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface MeUser {
  username: string;
  email: string;
  redditUsername: string | null;
  isPaid: boolean;
}

const STATUS_MESSAGES: Record<string, { ok: boolean; text: string }> = {
  ok: { ok: true, text: "Your Reddit account is connected." },
  denied: { ok: false, text: "Reddit connection was cancelled." },
  inuse: {
    ok: false,
    text: "That Reddit account is already linked to another profile.",
  },
  badstate: { ok: false, text: "Connection expired. Please try again." },
  failed: { ok: false, text: "Couldn't connect Reddit. Please try again." },
};

function AccountContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("reddit");
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const statusMsg = status ? STATUS_MESSAGES[status] : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
        Account
      </h1>
      <p className="mb-10 text-sm text-zinc-500">
        Manage your account and the Reddit account you analyze.
      </p>

      {statusMsg && (
        <div
          className={`mb-6 rounded-lg border p-4 text-sm ${
            statusMsg.ok
              ? "border-green-accent/40 bg-green-accent/5 text-green-accent"
              : "border-red-500/40 bg-red-500/5 text-red-300"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-card-border bg-card-bg p-6 text-sm text-zinc-400">
          Loading…
        </div>
      ) : !user ? (
        <div className="rounded-xl border border-card-border bg-card-bg p-6">
          <p className="mb-4 text-sm text-zinc-300">
            Please sign in to manage your account.
          </p>
          <Link
            href="/signin?redirect=/account"
            className="inline-block rounded-lg bg-green-accent px-5 py-2 text-sm font-bold text-white hover:bg-[#cc3700]"
          >
            Sign in
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Account info */}
          <div className="rounded-xl border border-card-border bg-card-bg p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Profile
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Name</dt>
                <dd className="text-zinc-200">{user.username}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Email</dt>
                <dd className="text-zinc-200">{user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Plan</dt>
                <dd className="text-zinc-200">
                  {user.isPaid ? "Lifetime Pro" : "Free"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Reddit connection */}
          <div className="rounded-xl border border-card-border bg-card-bg p-6">
            <h2 className="mb-1 text-lg font-semibold text-foreground">
              Reddit account
            </h2>
            <p className="mb-4 text-sm text-zinc-400">
              redditprofile only ever analyzes the Reddit account you connect
              here. We use Reddit&apos;s official sign-in to confirm the account
              is yours, and request read-only access to your identity.
            </p>

            {user.redditUsername ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  <span className="text-zinc-500">Connected as </span>
                  <span className="font-semibold text-green-accent">
                    u/{user.redditUsername}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/search"
                    className="rounded-lg bg-green-accent px-4 py-2 text-sm font-bold text-white hover:bg-[#cc3700]"
                  >
                    View my analytics
                  </Link>
                  <a
                    href="/api/auth/reddit"
                    className="rounded-lg border border-card-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:border-green-accent/30"
                  >
                    Reconnect
                  </a>
                </div>
              </div>
            ) : (
              <a
                href="/api/auth/reddit"
                className="inline-block rounded-lg bg-green-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-[#cc3700]"
              >
                Connect Reddit
              </a>
            )}
          </div>

          {!user.isPaid && (
            <div className="rounded-xl border border-green-accent/40 bg-green-accent/5 p-6">
              <h2 className="mb-1 text-lg font-semibold text-foreground">
                Upgrade to Lifetime Pro
              </h2>
              <p className="mb-4 text-sm text-zinc-400">
                Unlimited refreshes and full CSV export of your history — one
                payment, lifetime access.
              </p>
              <a
                href="/api/checkout"
                className="inline-block rounded-lg bg-green-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-[#cc3700]"
              >
                Get Lifetime Pro — $3.99
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountContent />
    </Suspense>
  );
}
