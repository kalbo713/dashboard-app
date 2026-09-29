// Copyright 2026 Ralph Burgos - All Rights Reserved.
"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Radio } from "lucide-react";

const STREAM_URL = "https://stream.zeno.fm/0r0xa792kwzuv";

export default function FocusRadioWidget() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const audio = new Audio(STREAM_URL);
    audioRef.current = audio;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [mounted]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setIsPlaying(false));
    }
  };

  if (!mounted) {
    return (
      <section className="glass p-6 md:p-7 h-full flex flex-col animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/40" />
          <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="flex-1 min-h-[80px] flex items-center justify-center rounded-xl bg-white/5 animate-pulse" />
      </section>
    );
  }

  return (
    <section className="glass p-6 md:p-7 h-full flex flex-col animate-slide-up">
      <header className="flex items-center gap-2 mb-4 shrink-0">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/40 shadow-[0_0_26px_rgba(139,92,246,0.5)]">
          <Radio className="w-4 h-4" aria-hidden />
        </span>
        <div className="space-y-0.5">
          <h2 className="text-base md:text-lg font-medium text-slate-50">Focus Radio</h2>
          <p className="text-[0.7rem] md:text-xs uppercase tracking-[0.22em] text-slate-400">
            Lofi stream
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-[80px] flex flex-col items-center justify-center gap-4">
        <button
          type="button"
          onClick={toggle}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${isPlaying
              ? "border-violet-400 bg-violet-500/20 text-violet-200 shadow-[0_0_40px_rgba(139,92,246,0.4)]"
              : "border-violet-500/50 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
            }`}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" aria-hidden />
          ) : (
            <Play className="w-6 h-6 ml-0.5" aria-hidden />
          )}
          {isPlaying && (
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-30 bg-violet-400"
              aria-hidden
            />
          )}
        </button>

        {isPlaying && (
          <div className="flex items-center gap-1.5 h-5" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="visualizer-bar w-1.5 rounded-full bg-violet-400/90"
                style={{
                  height: "20px",
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
