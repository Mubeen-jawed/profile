"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(
      () => setDots((d) => (d.length >= 3 ? "." : d + ".")),
      500
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-accent/10 ring-8 ring-green-accent/5">
          <svg
            className="h-10 w-10 text-green-accent"
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
        </div>

        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Payment successful!
        </h1>
        <p className="mb-8 text-zinc-400">
          You now have{" "}
          <span className="font-semibold text-green-accent">lifetime access</span>{" "}
          to all search results. No limits, ever.
        </p>

        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-lg bg-green-accent px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#cc3700]"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Start searching
        </Link>

        <p className="mt-6 text-xs text-zinc-600">
          Your account is being updated{dots}
        </p>
      </div>
    </div>
  );
}
