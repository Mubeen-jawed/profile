"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ttp_nsfw_popup_dismissed";
const SHOW_DELAY_MS = 4000;

type Stage = "prompt" | "input" | "result" | "error";

interface NsfwResult {
  username: string;
  found: boolean;
  isNsfw: boolean;
}

export default function NsfwCheckPopup() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<Stage>("prompt");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NsfwResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    const t = setTimeout(() => {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    }, SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  function dismissForever() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    close();
  }

  function close() {
    setVisible(false);
    setTimeout(() => setMounted(false), 250);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username
      .trim()
      .replace(/^https?:\/\/(www\.|old\.|new\.)?reddit\.com\//i, "")
      .replace(/^\/?(u|user)\//i, "")
      .replace(/\/+$/, "");
    if (!trimmed) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(
        `/api/nsfw-check?username=${encodeURIComponent(trimmed)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStage("error");
        return;
      }
      setResult(data);
      setStage("result");
    } catch {
      setErrorMsg("Network error. Try again.");
      setStage("error");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setUsername("");
    setResult(null);
    setErrorMsg("");
    setStage("input");
  }

  if (!mounted) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 w-[calc(100vw-2rem)] max-w-sm transition-all duration-300 sm:bottom-6 sm:left-6 ${
        visible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
      }`}
      role="dialog"
      aria-label="NSFW profile check"
    >
      <div className="rounded-2xl border border-card-border bg-card-bg p-5 shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {stage === "prompt" && (
          <>
            <h3 className="mb-2 pr-6 text-base font-bold leading-snug text-foreground">
              Do you wanna know if your profile is marked as NSFW or not?
            </h3>
            <p className="mb-4 text-xs text-zinc-400">
              Reddit may silently flag your account, see in 2 seconds.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setStage("input")}
                className="w-full rounded-lg bg-green-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#cc3700]"
              >
                YES PLS
              </button>
              <button
                onClick={dismissForever}
                className="w-full rounded-lg border border-card-border bg-background py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
              >
                Nahh, do not show this popup again
              </button>
            </div>
          </>
        )}

        {stage === "input" && (
          <>
            <h3 className="mb-3 pr-6 text-base font-bold leading-snug text-foreground">
              Enter your Reddit username
            </h3>
            <form onSubmit={submit} className="space-y-3">
              <div className="flex items-center rounded-lg border border-card-border bg-background px-3 focus-within:border-green-accent/50">
                <span className="text-sm text-zinc-500">u/</span>
                <input
                  autoFocus
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  maxLength={50}
                  className="w-full bg-transparent py-2.5 pl-1 text-sm text-foreground placeholder-zinc-600 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full rounded-lg bg-green-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#cc3700] disabled:opacity-50"
              >
                {loading ? "Checking..." : "Check now"}
              </button>
            </form>
          </>
        )}

        {stage === "result" && result && (
          <>
            <h3 className="mb-1 pr-6 text-sm font-medium text-zinc-400">
              u/{result.username}
            </h3>
            {!result.found ? (
              <div className="mb-4">
                <p className="text-base font-bold text-foreground">
                  Profile not found
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Reddit returned a 404 for this username.
                </p>
              </div>
            ) : result.isNsfw ? (
              <div className="mb-4">
                <p className="text-base font-bold text-red-400">
                  🔞 Marked as NSFW
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Your profile is flagged as 18+ on Reddit.
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-base font-bold text-green-accent">
                  ✓ Not marked as NSFW
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Your profile is safe-for-work on Reddit.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="flex-1 rounded-lg border border-card-border bg-background py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-green-accent/30"
              >
                Check another
              </button>
              <button
                onClick={close}
                className="flex-1 rounded-lg bg-green-accent py-2 text-xs font-semibold text-white transition-colors hover:bg-[#cc3700]"
              >
                Done
              </button>
            </div>
          </>
        )}

        {stage === "error" && (
          <>
            <h3 className="mb-2 pr-6 text-base font-bold text-foreground">
              Something went wrong
            </h3>
            <p className="mb-4 text-xs text-zinc-400">{errorMsg}</p>
            <button
              onClick={reset}
              className="w-full rounded-lg bg-green-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#cc3700]"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
