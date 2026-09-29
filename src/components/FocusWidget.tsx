// Copyright 2026 Ralph Burgos - All Rights Reserved.
"use client";

import { useEffect, useState, useCallback } from "react";
import { Target } from "lucide-react";

const STORAGE_KEY = "dashboard-focus-of-the-day";

export default function FocusWidget() {
  const [focus, setFocus] = useState("");
  const [savedFocus, setSavedFocus] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const loadStoredFocus = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      if (value) setSavedFocus(value);
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    setHydrated(true);
    loadStoredFocus();
  }, [loadStoredFocus]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = focus.trim();
    if (!trimmed) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, trimmed);
      setSavedFocus(trimmed);
      setFocus("");
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      setSavedFocus(null);
      setFocus("");
    } catch {
      // ignore
    }
  };

  if (!hydrated) {
    return (
      <section className="glass p-6 md:p-7 lg:p-8 mt-6 animate-pulse">
        <div className="h-5 w-32 rounded bg-white/10 mb-4" />
        <div className="h-11 rounded-xl bg-white/10" />
      </section>
    );
  }

  return (
    <section className="glass p-6 md:p-7 lg:p-8 mt-6 animate-slide-up">
      <header className="flex items-center gap-2 mb-4">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/40 shadow-[0_0_22px_rgba(56,189,248,0.55)]">
          <Target className="w-4 h-4" aria-hidden />
        </span>
        <div className="space-y-0.5 text-left">
          <h2 className="text-base md:text-lg font-medium text-slate-50">
            Focus of the Day
          </h2>
          <p className="text-[0.7rem] md:text-xs uppercase tracking-[0.22em] text-slate-400">
            One thing that truly matters
          </p>
        </div>
      </header>

      {savedFocus ? (
        <div className="space-y-3">
          <p className="text-lg md:text-xl font-light text-slate-50 leading-relaxed break-words">
            {savedFocus}
          </p>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs md:text-sm text-sky-300/80 hover:text-sky-200 inline-flex items-center gap-1 transition-colors"
          >
            <span className="h-[1px] w-5 bg-sky-400/70" />
            Clear &amp; set a new focus
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            value={focus}
            onChange={(event) => setFocus(event.target.value)}
            placeholder="What is the one thing that would make today meaningful?"
            className="w-full rounded-2xl border border-slate-600/60 bg-slate-900/60 px-4 py-3 md:py-3.5 text-base md:text-lg text-slate-50 placeholder:text-slate-500 shadow-[0_18px_45px_rgba(15,23,42,0.95)] focus:border-sky-400/90 focus:ring-2 focus:ring-sky-400/60 focus:shadow-[0_0_32px_rgba(56,189,248,0.95)] focus:outline-none transition-[border,box-shadow,background-color,transform] duration-200 ease-out"
            aria-label="Focus of the day"
          />
          <p className="text-[0.7rem] md:text-xs text-slate-500">
            Press <span className="text-slate-300 font-medium">Enter</span> to
            lock it in.
          </p>
        </form>
      )}
    </section>
  );
}

