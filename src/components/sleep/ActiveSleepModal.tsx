"use client";

import React, { useState } from "react";
import { useSleep } from "@/context/SleepContext";
import { Moon, Star, X, Check, AlertCircle, Minimize2 } from "lucide-react";
import confetti from "canvas-confetti";
import RedEmbers from "@/components/common/RedEmbers";

export default function ActiveSleepModal() {
  const {
    isSleeping,
    activeSession,
    elapsedSeconds,
    showSleepOverlay,
    setShowSleepOverlay,
    stopSleep,
    cancelSleep,
  } = useSleep();

  const [qualityRating, setQualityRating] = useState(5);
  const [sleepNotes, setSleepNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isSleeping || !showSleepOverlay || !activeSession) {
    return null;
  }

  // Format elapsed seconds into HH:MM:SS
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  const startTimeStr = new Date(activeSession.startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const handleInstantWakeUp = async () => {
    setSubmitting(true);
    // Turns off immediately via optimistic update inside stopSleep
    await stopSleep(qualityRating, sleepNotes);
    setSubmitting(false);

    try {
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FF2638", "#B5121B", "#FFFFFF"],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808] text-[#F5F5F5] p-4 select-none overflow-hidden animate-fadeIn">
      {/* Cinematic Red Radial Glow in center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(181,18,27,0.2)_0%,rgba(8,8,8,0.95)_75%)] pointer-events-none" />

      {/* Slowly Animated Spider Web Lattice Mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
        <svg
          className="w-[800px] h-[800px] text-[#FF2638] animate-web-pulse"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Radial Spokes */}
          <line x1="250" y1="250" x2="250" y2="10" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" className="web-line" />
          <line x1="250" y1="250" x2="420" y2="80" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" className="web-line" />
          <line x1="250" y1="250" x2="490" y2="250" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" className="web-line" />
          <line x1="250" y1="250" x2="420" y2="420" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" className="web-line" />
          <line x1="250" y1="250" x2="250" y2="490" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" className="web-line" />
          <line x1="250" y1="250" x2="80" y2="420" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" className="web-line" />
          <line x1="250" y1="250" x2="10" y2="250" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" className="web-line" />
          <line x1="250" y1="250" x2="80" y2="80" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" className="web-line" />

          {/* Web concentric polygon rings */}
          <polygon points="250,190 292,208 310,250 292,292 250,310 208,292 190,250 208,208" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
          <polygon points="250,130 335,165 370,250 335,335 250,370 165,335 130,250 165,165" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />
          <polygon points="250,70 377,123 430,250 377,377 250,430 123,377 70,250 123,123" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
        </svg>
      </div>

      {/* Sparingly Animated Red Embers */}
      <RedEmbers count={6} />

      {/* Top Controls: Minimize button */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
        <button
          onClick={() => setShowSleepOverlay(false)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151515] hover:bg-[#1C1C1C] text-[#999999] hover:text-white text-sm border border-[#292929] hover:border-[#FF2638]/40 transition-colors shadow-lg cursor-pointer"
          title="Minimize sleep sanctuary (tracking remains active in background)"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Minimize</span>
        </button>
      </div>

      {/* Main Sleep Sanctuary Centerpiece */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full px-4">
        {/* Soft Animated Moon & Web Crest */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#B5121B]/40 via-[#FF2638]/20 to-transparent flex items-center justify-center border border-[#FF2638]/40 shadow-[0_0_50px_rgba(255,38,56,0.35)] animate-pulse">
            <Moon className="w-14 h-14 text-white drop-shadow-[0_0_15px_#FF2638]" />
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#151515] border border-[#FF2638]/60 text-[10px] font-bold text-[#FF2638] uppercase tracking-widest whitespace-nowrap shadow-md">
            Resting &bull; {startTimeStr}
          </span>
        </div>

        {/* Live Elapsed Time Counter */}
        <div className="mb-3">
          <div className="font-mono text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,38,56,0.3)]">
            {pad(hours)}<span className="text-[#FF2638] animate-pulse">:</span>{pad(minutes)}<span className="text-[#FF2638] animate-pulse">:</span>{pad(seconds)}
          </div>
          <p className="text-[#999999] text-xs sm:text-sm tracking-wider uppercase mt-1">
            Hours &bull; Minutes &bull; Seconds of Circadian Recovery
          </p>
        </div>

        {/* Rest Quality Rating Stars right on screen */}
        <div className="my-4 p-3 rounded-2xl bg-[#101010]/90 border border-[#292929] w-full max-w-xs">
          <p className="text-[11px] text-[#999999] font-medium mb-1.5">Rest Quality (tap to adjust):</p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setQualityRating(star)}
                className={`p-1 transition-transform hover:scale-125 cursor-pointer ${qualityRating >= star
                    ? "text-[#FF2638] drop-shadow-[0_0_8px_#FF2638]"
                    : "text-[#333333] hover:text-[#999999]"
                  }`}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
          </div>
        </div>

        {/* PROMINENT ONE-CLICK STOP SLEEP BUTTON */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm mt-1">
          <button
            onClick={handleInstantWakeUp}
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#B5121B] via-[#FF2638] to-[#B5121B] hover:from-[#C91620] hover:via-[#FF3D4E] hover:to-[#C91620] text-white font-black text-base shadow-[0_0_35px_rgba(255,38,56,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 border border-[#FF2638]/60 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>{submitting ? "STOPPING SLEEP..." : "STOP SLEEP (I'M AWAKE)"}</span>
          </button>
          <button
            onClick={cancelSleep}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs text-[#999999] hover:text-[#FF2638] hover:bg-[#B5121B]/10 transition-colors cursor-pointer"
          >
            Discard
          </button>
        </div>

        {/* Clinical Disclaimer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#999999]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#FF2638]" />
          <span>Sleep duration is calculated from user start/stop timestamps.</span>
        </div>
      </div>
    </div>
  );
}
