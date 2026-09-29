// Copyright 2026 Ralph Burgos - All Rights Reserved.
import ClientOnly from "@/components/ClientOnly";
import HeroSection, { DailyStoicQuote } from "@/components/HeroSection";
import FocusWidget from "@/components/FocusWidget";
import WeatherWidget from "@/components/WeatherWidget";
import WorldClockWidget from "@/components/WorldClockWidget";
import CryptoTickerWidget from "@/components/CryptoTickerWidget";
import TodoWidget from "@/components/TodoWidget";
import FocusRadioWidget from "@/components/FocusRadioWidget";

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 pb-10 flex flex-col items-center">
      <ClientOnly>
        <div className="w-full max-w-6xl pt-4 md:pt-6 flex flex-col flex-1">
          {/* Top: Greeting (Hero) + Focus of the Day */}
          <HeroSection />
          <div className="mt-6 max-w-2xl mx-auto w-full">
            <FocusWidget />
          </div>

          {/* Middle: Weather | Crypto Ticker */}
          <section className="mt-8 w-full" aria-label="Weather and crypto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <WeatherWidget />
              <CryptoTickerWidget />
            </div>
          </section>

          {/* Bottom: To-Do | World Clock | Focus Radio (3-column on desktop) */}
          <section className="mt-6 w-full" aria-label="To-do, world clock, and radio">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              <TodoWidget />
              <WorldClockWidget />
              <FocusRadioWidget />
            </div>
          </section>

          <div className="mt-8 max-w-3xl mx-auto w-full pb-2">
            <DailyStoicQuote />
          </div>
        </div>
      </ClientOnly>
    </main>
  );
}
