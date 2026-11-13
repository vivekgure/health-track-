"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Play, Pause, RotateCcw, Brain, CheckCircle, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import confetti from "canvas-confetti";

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionComplete?: () => void;
}

export default function FocusTimerModal({ isOpen, onClose, onSessionComplete }: FocusTimerModalProps) {
  const [sessionMinutes, setSessionMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [tag, setTag] = useState("Deep Work");
  const [ambientSound, setAmbientSound] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Audio ref for ambient white/pink noise synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    setSecondsLeft(sessionMinutes * 60);
  }, [sessionMinutes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      handleCompleteSession();
    }

    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  // Ambient sound synthesizer
  useEffect(() => {
    if (ambientSound && isActive) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2) * 0.04;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNodeRef.current = gain;

        noise.connect(gain);
        gain.connect(ctx.destination);
        noise.start(0);
      } catch (e) {
        console.error("Audio error:", e);
      }
    } else {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [ambientSound, isActive]);

  if (!isOpen) return null;

  const handleCompleteSession = async () => {
    try {
      await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: sessionMinutes,
          tag,
          completed: true,
        }),
      });

      setCompleted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF2638", "#B5121B", "#FFFFFF"],
      });

      if (onSessionComplete) onSessionComplete();
    } catch (e) {
      console.error("Focus session save error:", e);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsLeft(sessionMinutes * 60);
    setCompleted(false);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#151515] border border-[#FF2638]/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(255,38,56,0.25)] text-[#F5F5F5] animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#292929] mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638] border border-[#FF2638]/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Focus Mode Sanctuary</h2>
              <p className="text-xs text-[#999999]">Spider Web Single-Tasking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#101010] text-[#999999] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Duration Pills */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[
            { label: "Pomodoro (25m)", mins: 25 },
            { label: "Deep Block (50m)", mins: 50 },
            { label: "Sprint (15m)", mins: 15 },
          ].map((preset) => (
            <button
              key={preset.mins}
              disabled={isActive}
              onClick={() => {
                setSessionMinutes(preset.mins);
                setSecondsLeft(preset.mins * 60);
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                sessionMinutes === preset.mins
                  ? "bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white shadow-[0_0_12px_rgba(255,38,56,0.35)]"
                  : "bg-[#101010] text-[#999999] hover:text-white border border-[#292929]"
              } ${isActive ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Circular Progress & Timer */}
        <div className="relative flex flex-col items-center justify-center my-4">
          <div
            className={`relative w-48 h-48 rounded-full border-4 transition-all duration-700 flex items-center justify-center ${
              isActive
                ? "border-[#FF2638] shadow-[0_0_30px_rgba(255,38,56,0.45)]"
                : "border-[#292929]"
            }`}
          >
            {/* Subtle web lattice inside */}
            <div
              className={`absolute inset-2 rounded-full transition-all duration-700 ${
                isActive
                  ? "bg-[#B5121B]/15 border border-[#FF2638]/30 animate-pulse"
                  : "bg-transparent"
              }`}
            />
            <div className="text-center relative z-10">
              <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,38,56,0.4)]">
                {pad(minutes)}:{pad(seconds)}
              </div>
              <p className="text-xs text-[#FF2638] font-bold uppercase tracking-wider mt-1">
                {isActive ? "Flowing" : completed ? "Completed!" : "Ready"}
              </p>
            </div>
          </div>
        </div>

        {/* Session Tag */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-xs text-[#999999]">Target Focus:</span>
          <input
            type="text"
            value={tag}
            disabled={isActive}
            onChange={(e) => setTag(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#101010] border border-[#292929] text-[#F5F5F5] focus:outline-none focus:border-[#FF2638] max-w-[160px] text-center"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-6 py-3 rounded-2xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 ${
              isActive
                ? "bg-[#101010] text-[#FF2638] border border-[#FF2638] shadow-[0_0_15px_rgba(255,38,56,0.3)]"
                : "bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white shadow-[0_0_20px_rgba(255,38,56,0.4)]"
            }`}
          >
            {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isActive ? "Pause Focus" : "Begin Focus Mode"}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-2xl bg-[#101010] hover:bg-[#1A1A1A] text-[#999999] hover:text-white border border-[#292929] transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setAmbientSound(!ambientSound)}
            className={`p-3 rounded-2xl border transition-colors ${
              ambientSound
                ? "bg-[#B5121B]/25 border-[#FF2638] text-[#FF2638] shadow-[0_0_10px_rgba(255,38,56,0.3)]"
                : "bg-[#101010] border-[#292929] text-[#999999] hover:text-white"
            }`}
            title="Toggle soothing pink noise"
          >
            {ambientSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Companion Extension notice */}
        <div className="p-3.5 rounded-2xl bg-[#101010] border border-[#292929] text-left flex items-start gap-2.5 text-xs text-[#999999]">
          <ShieldCheck className="w-4 h-4 text-[#FF2638] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Spider Focus Shield:</span> Distracting sites (YouTube, Twitter, Reddit) are blocked when the LifeSync Chrome Companion extension is loaded.
          </div>
        </div>
      </div>
    </div>
  );
}
