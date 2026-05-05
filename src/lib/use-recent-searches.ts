import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "ttp_recent_searches";
const MAX_RECENTS = 8;

export function useRecentSearches() {
  const [recents, setRecents] = useState<string[]>([]);

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch {}
  }, []);

  const addSearch = useCallback((username: string) => {
    const clean = username.trim();
    if (!clean) return;
    setRecents((prev) => {
      const next = [
        clean,
        ...prev.filter((r) => r.toLowerCase() !== clean.toLowerCase()),
      ].slice(0, MAX_RECENTS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeSearch = useCallback((username: string) => {
    setRecents((prev) => {
      const next = prev.filter((r) => r !== username);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setRecents([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { recents, addSearch, removeSearch, clearAll };
}
