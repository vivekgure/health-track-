"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Smartphone,
  Play,
  ShieldCheck,
  Laptop,
  Plus,
  Trash2,
} from "lucide-react";
import confetti from "canvas-confetti";
import FocusTimerModal from "@/components/modals/FocusTimerModal";

interface ScreenRecord {
  id: string;
  date: string;
  category: string;
  appName: string;
  durationMinutes: number;
  isProductive: boolean;
}

interface ScreenTimeData {
  date: string;
  totalMinutes: number;
  totalHours: number;
  limitMinutes: number;
  limitHours: number;
  percentOfLimit: number;
  productiveMinutes: number;
  productivityRatio: number;
  categories: { category: string; minutes: number; percentage: number }[];
  records: ScreenRecord[];
}

export default function ScreenTimePage() {
  const [data, setData] = useState<ScreenTimeData | null>(null);
  const [loading, setLoading] = useState(true);

  // Focus mode
  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const [focusShieldActive, setFocusShieldActive] = useState(false);

  // Manual screen log
  const [appName, setAppName] = useState("");
  const [category, setCategory] = useState("Productivity");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [isProductive, setIsProductive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/screentime");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Screen time fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleFocusShield = () => {
    const nextState = !focusShieldActive;
    setFocusShieldActive(nextState);

    // If extension is installed in browser, send message
    if (typeof window !== "undefined" && (window as unknown as { chrome?: { runtime?: { sendMessage: unknown } } }).chrome?.runtime) {
      try {
        (window as unknown as { chrome: { runtime: { sendMessage: (msg: object) => void } } }).chrome.runtime.sendMessage({
          action: "toggleFocusMode",
          enabled: nextState,
        });
      } catch {
        // ignore if not running in extension context
      }
    }

    if (nextState) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#FF2638", "#B5121B", "#FFFFFF"],
      });
    }
  };

  const handleLogManualScreenTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim() || durationMinutes <= 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/screentime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName: appName.trim(),
          category,
          durationMinutes: Number(durationMinutes),
          isProductive,
        }),
      });

      if (res.ok) {
        setAppName("");
        await fetchData();
      }
    } catch (e) {
      console.error("Log screen time error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/screentime?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error("Delete record error:", e);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <FocusTimerModal
        isOpen={focusModalOpen}
        onClose={() => setFocusModalOpen(false)}
        onSessionComplete={fetchData}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF2638] uppercase tracking-widest">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Digital Wellbeing & Spider Web Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Screen Time Management
          </h1>
          <p className="text-xs sm:text-sm text-[#999999] mt-1">
            Track daily device usage, enforce focus mode, and prevent digital burnout
          </p>
        </div>

        <button
          onClick={() => setFocusModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,38,56,0.35)] transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch Focus Timer</span>
        </button>
      </div>

      {/* FOCUS MODE CONTROLLER BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#151515] border border-[#292929] hover:border-[#FF2638]/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#FF2638]/40 text-[#FF2638] text-xs font-bold mb-3 shadow-[0_0_10px_rgba(255,38,56,0.2)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF2638]" />
            <span>Spider Web Distraction Shield</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
            {focusShieldActive ? "Focus Shield Active" : "Focus Shield Paused"}
          </h2>
          <p className="text-[#999999] text-xs sm:text-sm max-w-lg leading-relaxed">
            When Focus Shield is active, our companion browser extension intercepts distracting websites (YouTube, Reddit, Twitter, Facebook) and redirects you to the LifeSync Mindful Breathing Sanctuary.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleFocusShield}
            className={`py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xl transition-all transform hover:-translate-y-0.5 ${
              focusShieldActive
                ? "bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white shadow-[0_0_20px_rgba(255,38,56,0.5)] border border-[#FF2638]"
                : "bg-[#101010] hover:bg-[#1A1A1A] text-white border border-[#292929] hover:border-[#FF2638]/40"
            }`}
          >
            {focusShieldActive ? "SHIELD ACTIVE (ON)" : "ACTIVATE FOCUS SHIELD"}
          </button>
        </div>
      </div>

      {/* USAGE GAUGES & CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Time & Progress */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929] flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#999999]">
              Total Screen Time Today
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-white font-mono">
                {data?.totalHours || 0}
              </span>
              <span className="text-[#999999] text-sm">/ {data?.limitHours || 4} hrs limit</span>
            </div>

            <div className="w-full bg-[#101010] h-3 rounded-full overflow-hidden mt-4 p-0.5 border border-[#292929]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  (data?.totalMinutes || 0) > (data?.limitMinutes || 240)
                    ? "bg-[#FF2638] shadow-[0_0_10px_#FF2638]"
                    : "bg-gradient-to-r from-[#B5121B] to-[#FF2638]"
                }`}
                style={{ width: `${Math.min(100, data?.percentOfLimit || 0)}%` }}
              />
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-[#292929] flex items-center justify-between text-xs text-[#999999]">
            <span>Productivity Ratio:</span>
            <span className="text-[#FF2638] font-bold">{data?.productivityRatio || 100}%</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#151515] border border-[#292929]">
          <h3 className="text-sm font-bold text-white mb-4">Category Breakdown</h3>

          <div className="space-y-3">
            {(data?.categories || []).map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{cat.category}</span>
                  <span className="text-[#999999]">
                    {Math.floor(cat.minutes / 60)}h {cat.minutes % 60}m ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-[#101010] h-2 rounded-full overflow-hidden border border-[#292929]">
                  <div
                    className={`h-full rounded-full ${
                      cat.category === "Productivity"
                        ? "bg-[#FF2638] shadow-[0_0_8px_#FF2638]"
                        : cat.category === "Social"
                        ? "bg-[#B5121B]"
                        : cat.category === "Entertainment"
                        ? "bg-[#7A0C12]"
                        : "bg-[#FF6675]"
                    }`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COMPANION EXTENSION INSTALLATION & ARCHITECTURE CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#151515] border border-[#292929]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#292929]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Laptop className="w-5 h-5 text-[#FF2638]" />
              <h3 className="text-base font-bold text-white">
                LifeSync Spider Companion Extension
              </h3>
            </div>
            <p className="text-xs text-[#999999] max-w-xl">
              Web browser security boundaries prevent regular websites from inspecting external tabs or executing system-wide blocking. Our bundled companion extension provides true website accountability and focus blocking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#B5121B]/15 text-[#FF2638] text-xs font-bold border border-[#FF2638]/40">
              Scaffold in /extension
            </span>
          </div>
        </div>

        {/* 3 Step Installation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-[#101010] border border-[#292929]">
            <span className="w-6 h-6 rounded-full bg-[#B5121B] text-white text-xs font-bold flex items-center justify-center mb-2">
              1
            </span>
            <p className="text-xs font-bold text-white">Open Chrome Extensions</p>
            <p className="text-[11px] text-[#999999] mt-1">
              Navigate to <code className="text-[#FF2638]">chrome://extensions/</code> in your browser.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#101010] border border-[#292929]">
            <span className="w-6 h-6 rounded-full bg-[#B5121B] text-white text-xs font-bold flex items-center justify-center mb-2">
              2
            </span>
            <p className="text-xs font-bold text-white">Enable Developer Mode</p>
            <p className="text-[11px] text-[#999999] mt-1">
              Toggle the switch in the upper right corner to on.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#101010] border border-[#292929]">
            <span className="w-6 h-6 rounded-full bg-[#B5121B] text-white text-xs font-bold flex items-center justify-center mb-2">
              3
            </span>
            <p className="text-xs font-bold text-white">Click &quot;Load unpacked&quot;</p>
            <p className="text-[11px] text-[#999999] mt-1">
              Select the <code className="text-[#FF2638]">extension</code> directory in your workspace.
            </p>
          </div>
        </div>
      </div>

      {/* MANUAL SCREEN TIME ENTRY & LOGGED SESSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929]">
          <h3 className="text-sm font-bold text-white mb-2">Log App or Website Time</h3>
          <p className="text-xs text-[#999999] mb-4">
            Record time spent on specific tools or tasks
          </p>

          <form onSubmit={handleLogManualScreenTime} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">
                App / Website Name
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. VS Code, Notion, YouTube"
                className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setIsProductive(e.target.value === "Productivity");
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
              >
                <option value="Productivity">Productivity</option>
                <option value="Social">Social Media</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Utility">Utility</option>
                <option value="Health">Health & Fitness</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="600"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,38,56,0.35)] transition-all disabled:opacity-50"
            >
              {submitting ? "Logging..." : "Log Usage Record"}
            </button>
          </form>
        </div>

        {/* Logged List */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#151515] border border-[#292929]">
          <h3 className="text-sm font-bold text-white mb-3">Logged Usage Records</h3>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {(data?.records || []).map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-2xl bg-[#101010] hover:bg-[#1A0507] border border-[#292929] flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{rec.appName}</p>
                  <p className="text-[11px] text-[#999999]">
                    <span className="font-semibold text-[#FF2638]">{rec.category}</span> &bull;{" "}
                    {rec.durationMinutes} minutes
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteRecord(rec.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-[#666666] hover:text-[#FF2638]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
