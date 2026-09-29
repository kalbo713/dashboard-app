// Copyright 2026 Ralph Burgos - All Rights Reserved.
"use client";

import { useEffect, useState } from "react";
import { Sun, CloudSun, Moon, Sparkles } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { label: "Good Morning", icon: Sun };
  if (hour >= 12 && hour < 17) return { label: "Good Afternoon", icon: CloudSun };
  return { label: "Good Evening", icon: Moon };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type StoicPayload = {
  quote: string;
  author: string;
};

const FALLBACK_QUOTES: StoicPayload[] = [
  {
    quote: "We suffer more often in imagination than in reality.",
    author: "Seneca",
  },
  {
    quote: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
  },
  {
    quote: "How long are you going to wait before you demand the best for yourself?",
    author: "Epictetus",
  },
  {
    quote: "Waste no more time arguing what a good man should be. Be one.",
    author: "Marcus Aurelius",
  },
];

function DailyStoicQuote() {
  const [quote, setQuote] = useState<StoicPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadQuote = async () => {
      try {
        const res = await fetch("https://stoic.tekloon.net/stoic-quote");
        if (!res.ok) throw new Error("Failed to fetch quote");
        const data = (await res.json()) as { data?: StoicPayload } & StoicPayload;

        const payload: StoicPayload | undefined = (data as any).data ?? {
          quote: (data as any).quote,
          author: (data as any).author,
        };

        if (isMounted && payload && payload.quote) {
          setQuote(payload);
        }
      } catch {
        // gracefully fall back to a local selection
        const local = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
        if (isMounted) {
          setQuote(local);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadQuote();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      aria-label="Daily Stoic quote"
      className="mt-10 max-w-3xl mx-auto glass p-5 md:p-6 lg:p-7 animate-slide-up"
    >
      <div className="flex items-center gap-2 mb-2 text-sm uppercase tracking-[0.18em] text-sky-300/90">
        <Sparkles className="w-4 h-4" aria-hidden />
        <span>Daily Stoic</span>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-10/12" />
          <div className="h-4 bg-white/8 rounded w-8/12" />
        </div>
      ) : (
        quote && (
          <div className="space-y-3">
            <p className="text-base md:text-lg leading-relaxed text-slate-100">
              “{quote.quote}”
            </p>
            <p className="text-xs md:text-sm text-slate-400">— {quote.author}</p>
          </div>
        )
      )}
    </section>
  );
}

export default function HeroSection() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const greeting = getGreeting();
  const Icon = greeting.icon;

  if (!now) {
    return (
      <section className="pt-14 md:pt-20 pb-6">
        <div className="max-w-4xl mx-auto text-center space-y-4 animate-pulse">
          <div className="mx-auto h-6 w-40 bg-white/10 rounded-full" />
          <div className="mx-auto h-20 w-60 bg-white/10 rounded-3xl" />
        </div>
      </section>
    );
  }

  return (
    <section className="pt-14 md:pt-20 pb-4 px-4">
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-1.5 text-xs md:text-sm text-slate-300 shadow-[0_0_0_1px_rgba(15,23,42,0.9)]">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-slate-950 shadow-[0_0_25px_rgba(129,140,248,0.9)]">
            <Icon className="w-3.5 h-3.5" aria-hidden />
          </span>
          <span className="tracking-[0.2em] uppercase">{greeting.label}</span>
        </p>

        <h1 className="mt-6 text-6xl sm:text-7xl md:text-8xl lg:text-[5.75rem] font-light tracking-tight gradient-text tabular-nums drop-shadow-[0_18px_60px_rgba(15,23,42,0.95)]">
          {formatTime(now)}
        </h1>

        <p className="mt-4 text-sm md:text-base text-slate-400 font-light">
          {formatDate(now)}
        </p>
      </div>
    </section>
  );
}

export { DailyStoicQuote };

