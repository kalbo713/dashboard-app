// Copyright 2026 Ralph Burgos - All Rights Reserved.
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Radio, Volume2, VolumeX, Loader2, AlertCircle } from "lucide-react";

interface Station {
  id: string;
  name: string;
  tag: string;
  url: string;
}

const STATIONS: Station[] = [
  {
    id: "lofi-beats",
    name: "Lofi Beats",
    tag: "Chillhop & Beats",
    url: "https://lofi.stream.laut.fm/lofi",
  },
  {
    id: "groove-salad",
    name: "Groove Salad",
    tag: "Ambient & Chill",
    url: "https://ice1.somafm.com/groovesalad-128-mp3",
  },
  {
    id: "vaporwaves",
    name: "Vaporwaves",
    tag: "Dream & Retro",
    url: "https://ice1.somafm.com/vaporwaves-128-mp3",
  },
];

export default function FocusRadioWidget() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station>(STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync volume & mute state with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setIsLoading(false);
    } else {
      setErrorMessage(null);
      setIsLoading(true);

      // Ensure stream URL is loaded fresh to avoid stale buffered chunks
      if (!audio.src || audio.src !== selectedStation.url) {
        audio.src = selectedStation.url;
      }
      audio.load();

      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err: unknown) {
        console.error("Audio play error:", err);
        setIsPlaying(false);
        setErrorMessage("Playback blocked or stream temporarily unavailable.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [isPlaying, selectedStation.url]);

  const handleStationChange = (station: Station) => {
    if (station.id === selectedStation.id) return;
    setSelectedStation(station);
    setErrorMessage(null);

    const audio = audioRef.current;
    if (audio) {
      const wasPlaying = isPlaying;
      audio.pause();
      audio.src = station.url;
      audio.load();

      if (wasPlaying) {
        setIsLoading(true);
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error("Audio switch error:", err);
            setIsPlaying(false);
            setErrorMessage("Failed to start new station stream.");
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  if (!mounted) {
    return (
      <section className="glass p-6 md:p-7 h-full flex flex-col animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/40" />
          <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="flex-1 min-h-[140px] flex items-center justify-center rounded-xl bg-white/5 animate-pulse" />
      </section>
    );
  }

  return (
    <section className="glass p-6 md:p-7 h-full flex flex-col animate-slide-up">
      {/* Hidden native HTML5 Audio element */}
      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
        onPlaying={() => {
          setIsPlaying(true);
          setIsLoading(false);
        }}
        onWaiting={() => setIsLoading(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setIsLoading(false);
          setErrorMessage("Stream error encountered. Please click play to retry.");
        }}
      />

      {/* Header */}
      <header className="flex items-center justify-between gap-2 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/40 shadow-[0_0_26px_rgba(139,92,246,0.5)]">
            <Radio className="w-4 h-4" aria-hidden />
          </span>
          <div className="space-y-0.5">
            <h2 className="text-base md:text-lg font-medium text-slate-50">Focus Radio</h2>
            <p className="text-[0.7rem] md:text-xs uppercase tracking-[0.22em] text-slate-400">
              {selectedStation.name} • {isPlaying ? "Live" : "Ready"}
            </p>
          </div>
        </div>

        {/* Station Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedStation.id}
            onChange={(e) => {
              const station = STATIONS.find((s) => s.id === e.target.value);
              if (station) handleStationChange(station);
            }}
            className="rounded-lg border border-white/10 bg-slate-900/70 px-2.5 py-1 text-xs text-slate-300 hover:text-white focus:border-violet-400/80 focus:outline-none transition-colors cursor-pointer"
            aria-label="Select radio station"
          >
            {STATIONS.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Error notification if any */}
      {errorMessage && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      {/* Main Controls Center */}
      <div className="flex-1 min-h-[100px] flex flex-col items-center justify-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          disabled={isLoading}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
            isPlaying
              ? "border-violet-400 bg-violet-500/20 text-violet-200 shadow-[0_0_40px_rgba(139,92,246,0.45)]"
              : "border-violet-500/50 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
          } ${isLoading ? "opacity-75 cursor-wait" : ""}`}
          aria-label={isPlaying ? "Pause Focus Radio" : "Play Focus Radio"}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-violet-300" aria-hidden />
          ) : isPlaying ? (
            <Pause className="w-6 h-6" aria-hidden />
          ) : (
            <Play className="w-6 h-6 ml-0.5" aria-hidden />
          )}

          {isPlaying && !isLoading && (
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-30 bg-violet-400"
              aria-hidden
            />
          )}
        </button>

        {/* Visualizer bars during active playback */}
        <div className="flex items-center gap-1.5 h-5" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                isPlaying && !isLoading
                  ? "visualizer-bar bg-violet-400/90"
                  : "h-1 bg-white/10"
              }`}
              style={{
                height: isPlaying && !isLoading ? "20px" : "4px",
                animationDelay: `${i * 0.12}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Footer / Volume slider */}
      <footer className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between gap-3 text-xs text-slate-400">
        <button
          type="button"
          onClick={toggleMute}
          className="p-1 rounded-lg text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors focus:outline-none"
          aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-slate-300" />
          )}
        </button>

        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Volume slider"
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-400 focus:outline-none"
          />
        </div>

        <span className="tabular-nums text-[0.7rem] text-slate-500 w-7 text-right">
          {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
        </span>
      </footer>
    </section>
  );
}
