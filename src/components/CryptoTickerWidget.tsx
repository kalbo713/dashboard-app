// Copyright 2026 Ralph Burgos - All Rights Reserved.
"use client";

import { useCallback, useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Coins } from "lucide-react";

type CoinId = "bitcoin" | "ethereum" | "solana";

type CoinRow = {
  id: CoinId;
  name: string;
  symbol: string;
  usd: number;
  usd24h: number | null;
};

const COINS: { id: CoinId; name: string; symbol: string }[] = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "solana", name: "Solana", symbol: "SOL" },
];

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; rows: CoinRow[] };

function formatPrice(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
}

export default function CryptoTickerWidget() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    setState((s) => (s.status === "ready" ? s : { status: "loading" }));
    try {
      const ids = COINS.map((c) => c.id).join(",");
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = (await res.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;
      const rows: CoinRow[] = COINS.map((c) => {
        const d = data[c.id];
        const usd = typeof d?.usd === "number" ? d.usd : 0;
        const usd24h = typeof d?.usd_24h_change === "number" ? d.usd_24h_change : null;
        return { id: c.id, name: c.name, symbol: c.symbol, usd, usd24h };
      });
      setState({ status: "ready", rows });
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : "Failed to load",
      });
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    load();
    const id = setInterval(load, 60 * 1000);
    return () => clearInterval(id);
  }, [mounted, load]);

  if (!mounted) {
    return (
      <section className="glass p-6 md:p-7 h-full flex flex-col animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-amber-500/15" />
          <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="flex-1 divide-y divide-white/10 space-y-2">
          {COINS.map((c) => (
            <div key={c.id} className="py-2 flex justify-between">
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="glass p-6 md:p-7 h-full flex flex-col animate-slide-up">
      <header className="flex items-center justify-between gap-2 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40 shadow-[0_0_26px_rgba(245,158,11,0.4)]">
            <Coins className="w-4 h-4" aria-hidden />
          </span>
          <div className="space-y-0.5">
            <h2 className="text-base md:text-lg font-medium text-slate-50">Crypto</h2>
            <p className="text-[0.7rem] md:text-xs uppercase tracking-[0.22em] text-slate-400">
              Live prices
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={state.status === "loading"}
          className="p-2 rounded-lg text-slate-500 hover:text-amber-300 hover:bg-amber-500/10 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          aria-label="Refresh prices"
        >
          <RefreshCw className={`w-4 h-4 ${state.status === "loading" ? "animate-spin" : ""}`} />
        </button>
      </header>

      <div className="flex-1 min-h-[10rem] divide-y divide-white/10">
        {state.status === "loading" && (
          <>
            {COINS.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <span className="text-sm text-slate-400">{c.symbol}</span>
                <span className="text-sm text-slate-500 animate-pulse">—</span>
              </div>
            ))}
          </>
        )}
        {state.status === "error" && (
          <div className="py-4">
            <p className="text-sm text-rose-200/90 mb-2">{state.message}</p>
            <button
              type="button"
              onClick={load}
              className="text-sm text-amber-300 hover:text-amber-200"
            >
              Retry
            </button>
          </div>
        )}
        {state.status === "ready" &&
          state.rows.map((row) => (
            <div
              key={row.id}
              className="py-3 flex items-center justify-between gap-2"
            >
              <div>
                <p className="text-sm md:text-base font-medium text-slate-200">
                  {row.symbol}
                </p>
                <p className="text-xs text-slate-500">{row.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm md:text-base font-light tabular-nums text-slate-50">
                  {formatPrice(row.usd)}
                </p>
                {row.usd24h != null && (
                  <p
                    className={`text-xs tabular-nums flex items-center justify-end gap-0.5 ${row.usd24h >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                  >
                    {row.usd24h >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" aria-hidden />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" aria-hidden />
                    )}
                    {row.usd24h >= 0 ? "+" : ""}
                    {row.usd24h.toFixed(2)}%
                  </p>
                )}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
