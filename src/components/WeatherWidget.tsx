// Copyright 2026 Ralph Burgos - All Rights Reserved.
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  RefreshCw,
  Sun,
  Thermometer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type CityConfig = {
  name: string;
  latitude: string;
  longitude: string;
  timezone: string;
};

const CITIES: CityConfig[] = [
  { name: "New York", latitude: "40.7128", longitude: "-74.0060", timezone: "America/New_York" },
  { name: "Los Angeles", latitude: "34.0522", longitude: "-118.2437", timezone: "America/Los_Angeles" },
  { name: "London", latitude: "51.5074", longitude: "-0.1278", timezone: "Europe/London" },
  { name: "Miami", latitude: "25.7617", longitude: "-80.1918", timezone: "America/New_York" },
  { name: "Hong Kong", latitude: "22.3193", longitude: "114.1694", timezone: "Asia/Hong_Kong" },
];

type CityWeather = {
  name: string;
  temperatureF: number;
  weatherCode: number;
  isDay?: boolean;
};

type WeatherState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; cities: CityWeather[] };

const CACHE_KEY = "dashboard-weather-cache";
const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes

function weatherCodeToDisplay(code: number, isDay?: boolean): { label: string; Icon: LucideIcon } {
  if (code === 0) return { label: "Clear", Icon: isDay === false ? CloudMoon : Sun };
  if (code === 1) return { label: "Mainly Clear", Icon: CloudSun };
  if (code === 2) return { label: "Partly Cloudy", Icon: CloudSun };
  if (code === 3) return { label: "Overcast", Icon: Cloud };
  if (code === 45 || code === 48) return { label: "Fog", Icon: CloudFog };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Drizzle", Icon: CloudDrizzle };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: "Rain", Icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Snow", Icon: CloudSnow };
  if (code === 95) return { label: "Thunderstorm", Icon: CloudLightning };
  if (code === 96 || code === 99) return { label: "Thunderstorm (Hail)", Icon: CloudHail };
  return { label: "Mixed", Icon: Cloud };
}

function buildUrl(city: CityConfig): string {
  const u = new URL("https://api.open-meteo.com/v1/forecast");
  u.searchParams.set("latitude", city.latitude);
  u.searchParams.set("longitude", city.longitude);
  u.searchParams.set("temperature_unit", "fahrenheit");
  u.searchParams.set("timezone", city.timezone);
  u.searchParams.set("current", "temperature_2m,weather_code,is_day");
  return u.toString();
}

function WeatherSkeleton() {
  return (
    <div className="divide-y divide-white/10 flex-1">
      {CITIES.map((c) => (
        <div key={c.name} className="py-3 flex items-center gap-3 animate-pulse">
          <div className="h-9 w-9 rounded-xl bg-white/10 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-4 w-24 bg-white/10 rounded mb-1" />
            <div className="h-3 w-20 bg-white/10 rounded" />
          </div>
          <div className="h-6 w-12 bg-white/10 rounded shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default function WeatherWidget() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<WeatherState>({ status: "loading" });

  const load = useCallback(async (force = false) => {
    setState({ status: "loading" });

    if (!force) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { timestamp, data } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setState({ status: "ready", cities: data });
            return;
          }
        }
      } catch (e) {
        // ignore cache errors
      }
    }

    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const results = await Promise.all(
        CITIES.map(async (city) => {
          const res = await fetch(buildUrl(city), { signal, cache: "no-store" });
          if (!res.ok) throw new Error(`Weather failed (${res.status})`);
          const data = (await res.json()) as { current?: { temperature_2m?: number; weather_code?: number; is_day?: number } };
          const cur = data?.current;
          if (!cur || typeof cur.temperature_2m !== "number" || typeof cur.weather_code !== "number") {
            throw new Error("Unexpected response");
          }
          return {
            name: city.name,
            temperatureF: cur.temperature_2m,
            weatherCode: cur.weather_code,
            isDay: typeof cur.is_day === "number" ? cur.is_day === 1 : undefined,
          };
        })
      );

      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: results
      }));

      setState({ status: "ready", cities: results });
    } catch (e: unknown) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : "Could not load weather",
      });
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    load();
    const id = setInterval(() => {
      if (!cancelled) load();
    }, CACHE_DURATION);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [mounted, load]);

  return (
    <section className="glass p-6 md:p-7 lg:p-8 animate-slide-up h-full flex flex-col">
      <header className="flex items-center gap-2 mb-4 shrink-0">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/40 shadow-[0_0_26px_rgba(56,189,248,0.65)]">
          <Thermometer className="w-4 h-4" aria-hidden />
        </span>
        <div className="space-y-0.5">
          <h2 className="text-base md:text-lg font-medium text-slate-50">Weather</h2>
          <p className="text-[0.7rem] md:text-xs uppercase tracking-[0.22em] text-slate-400">
            Live • °F
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-[12.5rem] flex flex-col">
        {(!mounted || state.status === "loading") && <WeatherSkeleton />}

        {mounted && state.status === "error" && (
          <div className="space-y-3">
            <p className="text-sm text-rose-200/90">{state.message}</p>
            <button
              type="button"
              onClick={() => load(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200 hover:bg-black/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4" aria-hidden />
              Retry
            </button>
          </div>
        )}

        {mounted && state.status === "ready" && (
          <div className="divide-y divide-white/10">
            {state.cities.map((city) => {
              const { label, Icon } = weatherCodeToDisplay(city.weatherCode, city.isDay);
              return (
                <div
                  key={city.name}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30 shadow-[0_0_16px_rgba(56,189,248,0.4)]">
                      <Icon className="w-4 h-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm md:text-base font-medium text-slate-200 truncate">
                        {city.name}
                      </p>
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                  </div>
                  <p className="text-sm md:text-base font-light tabular-nums text-slate-50 shrink-0">
                    {Math.round(city.temperatureF)}°F
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
