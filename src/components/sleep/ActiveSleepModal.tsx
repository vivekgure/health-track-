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

  const [confirmingStop, setConfirmingStop] = useState(false);
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

  const handleConfirmWakeUp = async () => {
    setSubmitting(true);
    const res = await stopSleep(qualityRating, sleepNotes);
    setSubmitting(false);
    if (res.success) {
      setConfirmingStop(false);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FF2638", "#B5121B", "#FFFFFF"],
        });
      } catch {
        // ignore
      }
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
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151515] hover:bg-[#1C1C1C] text-[#999999] hover:text-white text-sm border border-[#292929] hover:border-[#FF2638]/40 transition-colors shadow-lg"
          title="Minimize sleep sanctuary (tracking remains active)"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Minimize</span>
        </button>
      </div>

      {/* Main Sanctuary Container */}
      <div className="relative max-w-lg w-full flex flex-col items-center text-center p-6 sm:p-8 z-10">
        {/* Glowing Crimson Moon & Spider Web Orb */}
        <div className="relative mb-6">
          <div className="absolute -inset-6 bg-[#FF2638]/20 rounded-full blur-2xl animate-pulse-slow"></div>
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-[#080808] via-[#1A0507] to-[#2B080B] border-2 border-[#FF2638]/60 shadow-[0_0_50px_rgba(255,38,56,0.4)] flex items-center justify-center">
            <Moon className="w-16 h-16 sm:w-20 sm:h-20 text-[#FF2638] drop-shadow-[0_0_20px_rgba(255,38,56,0.9)] fill-[#FF2638]/15" />
          </div>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151515] border border-[#FF2638]/40 text-[#FF2638] text-xs sm:text-sm font-bold mb-4 shadow-[0_0_12px_rgba(255,38,56,0.2)]">
          <span className="w-2 h-2 rounded-full bg-[#FF2638] animate-ping"></span>
          <span>Spider Sleep Mode &bull; Initiated at {startTimeStr}</span>
        </div>

        {/* Live Elapsed Time Counter */}
        <div className="mb-2">
          <div className="font-mono text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,38,56,0.3)]">
            {pad(hours)}<span className="text-[#FF2638] animate-pulse">:</span>{pad(minutes)}<span className="text-[#FF2638] animate-pulse">:</span>{pad(seconds)}
          </div>
          <p className="text-[#999999] text-xs sm:text-sm tracking-wider uppercase mt-2">
            Hours &bull; Minutes &bull; Seconds of Circadian Recovery
          </p>
        </div>

        <p className="text-[#999999] text-sm max-w-sm mt-3 mb-8 leading-relaxed">
          Cinematic dark screen active to preserve melatonin production. Your rest data is securely stored in your local database.
        </p>

        {/* Prominent Action Controls */}
        {!confirmingStop ? (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
            <button
              onClick={() => setConfirmingStop(true)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#B5121B] via-[#FF2638] to-[#B5121B] hover:from-[#C91620] hover:via-[#FF3D4E] hover:to-[#C91620] text-white font-black text-base shadow-[0_0_30px_rgba(255,38,56,0.55)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 border border-[#FF2638]/50"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>STOP SLEEP (I&apos;M AWAKE)</span>
            </button>
            <button
              onClick={cancelSleep}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs text-[#999999] hover:text-[#FF2638] hover:bg-[#B5121B]/10 transition-colors"
            >
              Discard Session
            </button>
          </div>
        ) : (
          /* Confirmation & Morning Rating Modal */
          <div className="w-full bg-[#151515] border border-[#FF2638]/50 rounded-3xl p-6 shadow-[0_0_40px_rgba(255,38,56,0.3)] backdrop-blur-xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-1">Morning Awakening 🌅</h3>
            <p className="text-[#999999] text-xs mb-4">
              Rate your sleep quality to finalize and log your session.
            </p>

            {/* Quality Rating Stars */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setQualityRating(star)}
                  className={`p-2 rounded-xl transition-all ${
                    qualityRating >= star
                      ? "text-[#FF2638] scale-110 drop-shadow-[0_0_10px_#FF2638]"
                      : "text-[#333333] hover:text-[#999999]"
                  }`}
                >
                  <Star className="w-7 h-7 fill-current" />
                </button>
              ))}
            </div>
            <div className="text-xs font-semibold text-[#FF2638] mb-4">
              {qualityRating === 5 && "⭐ Optimal Restorative Rest"}
              {qualityRating === 4 && "⭐ Good, Well-Rested Sleep"}
              {qualityRating === 3 && "⭐ Moderate Sleep"}
              {qualityRating === 2 && "⭐ Restless / Interrupted"}
              {qualityRating === 1 && "⭐ Poor / Insomnia"}
            </div>

            {/* Optional Notes */}
            <input
              type="text"
              value={sleepNotes}
              onChange={(e) => setSleepNotes(e.target.value)}
              placeholder="Dream notes or morning energy thoughts..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-sm text-[#F5F5F5] placeholder-[#666666] mb-5 focus:outline-none focus:border-[#FF2638]"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmingStop(false)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-[#101010] hover:bg-[#1A1A1A] text-[#999999] text-sm font-medium border border-[#292929] transition-colors"
              >
                Keep Sleeping
              </button>
              <button
                type="button"
                onClick={handleConfirmWakeUp}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white text-sm font-bold shadow-[0_0_18px_rgba(255,38,56,0.45)] transition-all disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Sleep Log"}
              </button>
            </div>
          </div>
        )}

        {/* Clinical Disclaimer Requirement */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-[#999999]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#FF2638]" />
          <span>Sleep duration is calculated from user start/stop timestamps, not clinical polysomnography.</span>
        </div>
      </div>
    </div>
  );
}
