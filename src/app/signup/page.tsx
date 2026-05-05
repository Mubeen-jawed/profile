"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function SignUpContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const errorMessages: Record<string, string> = {
    google_denied: "Google sign-in was cancelled. Please try again.",
    google_failed: "Google sign-in failed. Please try again.",
    rate_limit: "Too many attempts. Please try again later.",
    turnstile_failed: "Security verification failed. Please try again.",
  };

  useEffect(() => {
    if (!TURNSTILE_ENABLED) return;

    function renderWidget() {
      if (turnstileRef.current && window.turnstile && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
          callback: (token: string) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(""),
          "error-callback": () => setTurnstileToken(""),
          theme: "dark",
        });
      }
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.onload = () => {
        setTimeout(renderWidget, 100);
      };
      document.head.appendChild(script);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (TURNSTILE_ENABLED && !turnstileToken) return;
    setSubmitting(true);
    if (TURNSTILE_ENABLED) {
      window.location.href = `/api/auth/google?cf_token=${encodeURIComponent(turnstileToken)}`;
    } else {
      window.location.href = `/api/auth/google`;
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
            Create your account
          </h1>
          <p className="text-zinc-400">
            Get started with redditprofile using your Google account
          </p>
        </div>

        <div className="rounded-xl border border-card-border bg-card-bg p-6">
          {error && errorMessages[error] && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errorMessages[error]}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4 w-full overflow-x-auto">
              <div ref={turnstileRef} className="mx-auto w-fit" />
            </div>

            <button
              type="submit"
              disabled={(TURNSTILE_ENABLED && !turnstileToken) || submitting}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-card-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-green-accent/30 hover:bg-card-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {submitting ? "Redirecting..." : "Sign up with Google"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-zinc-500">
            By signing up, you agree to our{" "}
            <a href="/terms" className="text-green-accent hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-green-accent hover:underline">
              Privacy Policy
            </a>
            .
          </p>

          <p className="mt-3 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <a
              href="/signin"
              className="text-green-accent hover:text-[#ff6030]"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-card-border border-t-green-accent"></div>
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
