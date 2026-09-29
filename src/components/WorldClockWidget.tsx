// Copyright 2026 Ralph Burgos - All Rights Reserved.
"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";

type City = {
  name: string;
  timeZone: string;
};

const CITIES: City[] = [
  { name: "New York", timeZone: "America/New_York" },
  { name: "Los Angeles", timeZone: "America/Los_Angeles" },
  { name: "London", timeZone: "Europe/London" },
  { name: "Tokyo", timeZone: "Asia/Tokyo" },
  { name: "Hong Kong", timeZone: "Asia/Hong_Kong" },
];

function formatInZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export default function WorldClockWidget() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => {
    if (!now) return [];
    return CITIES.map((c) => ({
      ...c,
      time: formatInZone(now, c.timeZone),
    }));
  }, [now]);

  const listContent = !mounted ? (
    <div className="flex-1 min-h-[12.5rem] divide-y divide-white/10" aria-busy="true">
      {CITIES.map((c) => (
        <div key={c.timeZone} className="py-3 flex items-center justify-between">
          <p className="text-sm md:text-base text-slate-400">{c.name}</p>
          <p className="text-sm md:text-base font-light tabular-nums text-slate-500 animate-pulse">
            —:—:—
          </p>
        </div>
      ))}
    </div>
  ) : (
    <div className="flex-1 min-h-[12.5rem] divide-y divide-white/10">
      {rows.map((row) => (
        <div key={row.timeZone} className="py-3 flex items-center justify-between">
          <p className="text-sm md:text-base text-slate-200">{row.name}</p>
          <p className="text-sm md:text-base font-light tabular-nums text-slate-50">
            {row.time}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <section className="glass p-6 md:p-7 lg:p-8 animate-slide-up h-full flex flex-col">
      <header className="flex items-center gap-2 mb-4 shrink-0">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/40 shadow-[0_0_26px_rgba(129,140,248,0.6)]">
          <Clock className="w-4 h-4" aria-hidden />
        </span>
        <div className="space-y-0.5">
          <h2 className="text-base md:text-lg font-medium text-slate-50">World Clock</h2>
          <p className="text-[0.7rem] md:text-xs uppercase tracking-[0.22em] text-slate-400">
            Live seconds • DST auto
          </p>
        </div>
      </header>

      {listContent}
    </section>
  );
}

