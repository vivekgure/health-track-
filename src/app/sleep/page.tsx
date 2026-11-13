"use client";

import React, { useState } from "react";
import { useSleep } from "@/context/SleepContext";
import {
  Moon,
  Star,
  Clock,
  Sparkles,
  AlertCircle,
  Check,
  Plus,
  Trash2,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  LineChart,
  Line,
} from "recharts";
import confetti from "canvas-confetti";
import RedEmbers from "@/components/common/RedEmbers";

export default function SleepPage() {
  const {
    isSleeping,
    activeSession,
    elapsedSeconds,
    pastSessions,
    stats,
    setShowSleepOverlay,
    startSleep,
    stopSleep,
    logManualSleep,
    deleteSleepSession,
    resetSleepData,
  } = useSleep();

  // Manual log modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");
  const [manualRating, setManualRating] = useState(4);
  const [manualNotes, setManualNotes] = useState("");
  const [submittingManual, setSubmittingManual] = useState(false);

  // Reset sleep state
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resettingSleep, setResettingSleep] = useState(false);
  const [resetFeedback, setResetFeedback] = useState("");

  // Stop sleep confirmation state
  const [confirmingStop, setConfirmingStop] = useState(false);
  const [stopRating, setStopRating] = useState(5);
  const [stopNotes, setStopNotes] = useState("");
  const [submittingStop, setSubmittingStop] = useState(false);

  // Format elapsed timer
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  const handleStart = async () => {
    const res = await startSleep();
    if (res.success) {
      setShowSleepOverlay(true);
    }
  };

  const handleConfirmStop = async () => {
    setSubmittingStop(true);
    const res = await stopSleep(stopRating, stopNotes);
    setSubmittingStop(false);
    if (res.success) {
      setConfirmingStop(false);
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FF2638", "#B5121B", "#FFFFFF"],
        });
      } catch {
        // ignore
      }
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStart || !manualEnd) return;

    setSubmittingManual(true);
    const res = await logManualSleep({
      startTimeStr: manualStart,
      endTimeStr: manualEnd,
      qualityRating: manualRating,
      notes: manualNotes,
    });
    setSubmittingManual(false);

    if (res.success) {
      setShowManualModal(false);
      setManualNotes("");
    }
  };

  const handleConfirmResetSleep = async () => {
    setResettingSleep(true);
    const res = await resetSleepData();
    setResettingSleep(false);
    if (res.success) {
      setConfirmingReset(false);
      setResetFeedback("Sleep records, averages, and live timers have been reset to zero.");
      setTimeout(() => setResetFeedback(""), 4000);
    }
  };

  // Prepare chart data
  const chartData = [...pastSessions]
    .reverse()
    .slice(-14)
    .map((s) => {
      const d = new Date(s.endTime || s.startTime);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        hours: s.durationMinutes ? Number((s.durationMinutes / 60).toFixed(1)) : 0,
        quality: s.qualityRating || 4,
        consistency: s.sleepConsistency || 85,
      };
    });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF2638] uppercase tracking-widest">
            <Moon className="w-3.5 h-3.5" />
            <span>Circadian Rhythm & Spider Sanctuary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Sleep Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[#999999] mt-1">
            Real start/stop tracking, cross-midnight duration calculation, and schedule consistency
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setConfirmingReset(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-[#101010] hover:bg-[#1A0507] text-[#999999] hover:text-[#FF2638] text-xs font-bold transition-all border border-[#292929] hover:border-[#FF2638]/40 flex items-center gap-2"
            title="Reset all sleep sessions, averages, and live timers back to zero"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FF2638]" />
            <span>Reset Sleep Time & Averages</span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#151515] hover:bg-[#1A1A1A] text-white text-xs font-bold transition-all border border-[#292929] hover:border-[#FF2638]/40 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#FF2638]" />
            <span>Log Past Sleep</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Banner */}
      {confirmingReset && (
        <div className="p-4 rounded-2xl bg-[#1A0507] border border-[#FF2638]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-[#FF2638] shrink-0" />
            <p className="text-xs font-bold text-white">
              Reset entire sleep tracker? This will wipe all recorded nights, average hours, consistency score, and active session back to zero.
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleConfirmResetSleep}
              disabled={resettingSleep}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white text-xs font-bold shadow-[0_0_12px_rgba(255,38,56,0.5)] transition-all disabled:opacity-50"
            >
              {resettingSleep ? "Resetting..." : "Yes, Reset All to Zero"}
            </button>
            <button
              onClick={() => setConfirmingReset(false)}
              disabled={resettingSleep}
              className="px-3 py-1.5 rounded-xl bg-[#101010] text-[#999999] hover:text-white text-xs border border-[#292929]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success feedback */}
      {resetFeedback && (
        <div className="p-3.5 rounded-2xl bg-[#151515] border border-[#FF2638]/40 text-[#FF2638] text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{resetFeedback}</span>
        </div>
      )}

      {/* HERO LIVE SLEEP TRACKER CARD */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#101010] via-[#151515] to-[#1A0507] border border-[#292929] hover:border-[#FF2638]/40 shadow-2xl transition-all">
        <RedEmbers count={4} />

        {!isSleeping ? (
          /* IDLE / READY TO START SLEEP */
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#FF2638]/40 text-[#FF2638] text-xs font-bold mb-3 shadow-[0_0_10px_rgba(255,38,56,0.2)]">
                <Sparkles className="w-3 h-3 text-[#FF2638]" />
                <span>Ready for Bedtime Protocol</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">
                Time to Rest & Recharge
              </h2>
              <p className="text-[#999999] text-sm leading-relaxed mb-4">
                Initiate the sleep sanctuary when entering bed. LifeSync logs precise timestamps, handles cross-midnight recovery, and streams sleep data directly to your database.
              </p>
              <div className="flex items-center gap-4 text-xs text-[#999999]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#FF2638]" />
                  <span>Target: 8.0 hrs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#FF2638]" />
                  <span>Consistency: {stats?.totalSessions ? `${stats.consistencyScore}%` : "0%"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-end">
              <button
                onClick={handleStart}
                className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-[#B5121B] via-[#FF2638] to-[#B5121B] hover:from-[#C91620] hover:via-[#FF3D4E] hover:to-[#C91620] text-white font-black text-base shadow-[0_0_28px_rgba(255,38,56,0.5)] transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 border border-[#FF2638]/50"
              >
                <Moon className="w-6 h-6 fill-white/20" />
                <span>START SLEEP MODE</span>
              </button>
              <p className="text-[11px] text-[#999999] mt-2 text-center sm:text-right">
                Launches calming cinematic night screen
              </p>
            </div>
          </div>
        ) : (
          /* SLEEP ACTIVE CARD */
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A0507] border border-[#FF2638] text-[#FF2638] text-xs font-bold mb-3 shadow-[0_0_12px_rgba(255,38,56,0.3)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF2638] animate-ping" />
                <span>SLEEP SESSION ACTIVE IN PROGRESS</span>
              </div>
              <p className="text-xs text-[#999999] mb-1">
                Started at:{" "}
                <span className="text-white font-semibold">
                  {activeSession?.startTime
                    ? new Date(activeSession.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    : ""}
                </span>
              </p>
              <div className="font-mono text-4xl sm:text-5xl font-black text-white tracking-tight my-2">
                {pad(hours)}<span className="text-[#FF2638] animate-pulse">:</span>{pad(minutes)}<span className="text-[#FF2638] animate-pulse">:</span>{pad(seconds)}
              </div>
              <p className="text-xs text-[#999999]">
                Session is safely stored in database. Closing and reopening restores tracking.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full sm:w-auto">
              {!confirmingStop ? (
                <>
                  <button
                    onClick={() => setConfirmingStop(true)}
                    className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#B5121B] via-[#FF2638] to-[#B5121B] hover:from-[#C91620] hover:via-[#FF3D4E] hover:to-[#C91620] text-white font-black text-sm shadow-[0_0_20px_rgba(255,38,56,0.45)] transition-all flex items-center justify-center gap-2 border border-[#FF2638]/50"
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>STOP SLEEP (I&apos;M AWAKE)</span>
                  </button>

                  <button
                    onClick={() => setShowSleepOverlay(true)}
                    className="py-2.5 px-4 rounded-xl bg-[#101010] hover:bg-[#1A1A1A] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-[#292929]"
                  >
                    <Maximize2 className="w-4 h-4 text-[#FF2638]" />
                    <span>Open Fullscreen Sanctuary</span>
                  </button>
                </>
              ) : (
                /* Inline confirmation form */
                <div className="bg-[#151515] border border-[#FF2638]/40 rounded-2xl p-4 max-w-sm">
                  <p className="text-xs font-bold text-white mb-2">Rate Rest Quality:</p>
                  <div className="flex items-center gap-1.5 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStopRating(s)}
                        className={`p-1.5 rounded-lg text-lg ${stopRating >= s ? "text-[#FF2638]" : "text-[#333333]"
                          }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={stopNotes}
                    onChange={(e) => setStopNotes(e.target.value)}
                    placeholder="Morning note (optional)..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#101010] border border-[#292929] text-xs text-white mb-3 focus:outline-none focus:border-[#FF2638]"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmingStop(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#101010] text-[#999999] text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmStop}
                      disabled={submittingStop}
                      className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white font-bold text-xs"
                    >
                      {submittingStop ? "Saving..." : "Confirm & Save"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#151515] border border-[#292929]">
          <p className="text-xs text-[#999999] mb-1">Average Sleep</p>
          <p className="text-2xl font-black text-white font-mono">{stats?.totalSessions ? stats.avgHours : "0.0"} hrs</p>
          <p className="text-[11px] text-[#FF2638] font-bold mt-1">
            {stats?.totalSessions ? "Optimal Baseline" : "Zero Data (Fresh)"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#151515] border border-[#292929]">
          <p className="text-xs text-[#999999] mb-1">Consistency Score</p>
          <p className="text-2xl font-black text-[#FF2638] font-mono">
            {stats?.totalSessions ? `${stats.consistencyScore}%` : "0%"}
          </p>
          <p className="text-[11px] text-[#999999] mt-1">
            {stats?.totalSessions ? "Circadian Regularity" : "Ready to Track"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#151515] border border-[#292929]">
          <p className="text-xs text-[#999999] mb-1">Avg Quality Rating</p>
          <p className="text-2xl font-black text-white font-mono">
            {stats?.totalSessions ? `${stats.avgQuality} / 5` : "0 / 5"}
          </p>
          <p className="text-[11px] text-[#FF2638] font-bold mt-1">
            {stats?.totalSessions ? "Deep REM Rest" : "Unrated"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#151515] border border-[#292929]">
          <p className="text-xs text-[#999999] mb-1">Tracked Nights</p>
          <p className="text-2xl font-black text-white font-mono">{stats?.totalSessions || 0}</p>
          <p className="text-[11px] text-[#999999] mt-1">Database sessions</p>
        </div>
      </div>

      {/* CHARTS: Duration History & Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep Duration Bar Chart */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Sleep Duration History</h3>
              <p className="text-xs text-[#999999]">Hours slept per night with 8.0h target line</p>
            </div>
            <span className="text-xs font-bold text-[#FF2638]">Last 14 Sessions</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#666666" fontSize={10} tickLine={false} />
                <YAxis stroke="#666666" fontSize={10} tickLine={false} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#101010",
                    borderColor: "#292929",
                    borderRadius: "12px",
                    color: "#FFF",
                    fontSize: "12px",
                  }}
                />
                <ReferenceLine y={8.0} stroke="#FF2638" strokeDasharray="3 3" label={{ value: "8h Target", fill: "#FF2638", fontSize: 10 }} />
                <Bar dataKey="hours" fill="#FF2638" radius={[4, 4, 0, 0]} name="Hours Slept" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality & Consistency Trend */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Schedule Consistency Score</h3>
              <p className="text-xs text-[#999999]">Bedtime alignment & circadian stability</p>
            </div>
            <span className="text-xs font-bold text-[#FF2638]">Consistency %</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#666666" fontSize={10} tickLine={false} />
                <YAxis stroke="#666666" fontSize={10} tickLine={false} domain={[50, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#101010",
                    borderColor: "#292929",
                    borderRadius: "12px",
                    color: "#FFF",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="consistency" stroke="#FF2638" strokeWidth={2.5} dot={{ fill: "#FF2638", r: 3 }} name="Consistency %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SLEEP SESSIONS HISTORY TABLE */}
      <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929]">
        <h3 className="text-base font-bold text-white mb-4">Recent Sleep Sessions</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#292929] text-[#999999] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Bedtime</th>
                <th className="pb-3 font-semibold">Wake Time</th>
                <th className="pb-3 font-semibold">Duration</th>
                <th className="pb-3 font-semibold">Quality</th>
                <th className="pb-3 font-semibold">Consistency</th>
                <th className="pb-3 font-semibold">Notes</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292929]">
              {pastSessions.map((s) => {
                const startDate = new Date(s.startTime);
                const endDate = s.endTime ? new Date(s.endTime) : null;
                const durH = s.durationMinutes ? (s.durationMinutes / 60).toFixed(1) : "0";

                return (
                  <tr key={s.id} className="hover:bg-[#101010] transition-colors">
                    <td className="py-3 font-semibold text-white">
                      {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}
                    </td>
                    <td className="py-3 text-[#999999]">
                      {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 text-[#999999]">
                      {endDate ? endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-[#FF2638] font-mono">{durH} hrs</span>
                    </td>
                    <td className="py-3 text-[#FF2638]">
                      {"★".repeat(s.qualityRating || 4)}
                    </td>
                    <td className="py-3 text-white font-semibold">
                      {s.sleepConsistency || 85}%
                    </td>
                    <td className="py-3 text-[#999999] max-w-xs truncate">
                      {s.notes || "Restorative rest"}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => deleteSleepSession(s.id)}
                        className="p-1 rounded-lg hover:bg-rose-500/20 text-[#666666] hover:text-[#FF2638] transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Disclaimer */}
      <div className="p-4 rounded-2xl bg-[#101010] border border-[#292929] flex items-start gap-3 text-xs text-[#999999]">
        <AlertCircle className="w-4 h-4 text-[#FF2638] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Clinical Notice:</span> Sleep duration and consistency in LifeSync are derived from the interval between your start and stop commands. LifeSync is an intentional wellness tool and does not conduct medical polysomnography, EEG brainwave analysis, or clinical diagnosis.
        </div>
      </div>

      {/* MANUAL SLEEP LOG MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-[#151515] border border-[#292929] rounded-3xl p-6 shadow-2xl text-[#F5F5F5] animate-scaleUp">
            <h3 className="text-base font-bold text-white mb-1">Log Past Sleep Session</h3>
            <p className="text-xs text-[#999999] mb-4">
              Enter bedtime and wake-up times. Midnight crossing is calculated automatically.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#999999] mb-1">
                  Bedtime Timestamp (Start)
                </label>
                <input
                  type="datetime-local"
                  value={manualStart}
                  onChange={(e) => setManualStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white focus:outline-none focus:border-[#FF2638]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#999999] mb-1">
                  Wake-up Timestamp (End)
                </label>
                <input
                  type="datetime-local"
                  value={manualEnd}
                  onChange={(e) => setManualEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white focus:outline-none focus:border-[#FF2638]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#999999] mb-1">
                  Quality Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setManualRating(star)}
                      className={`text-xl ${manualRating >= star ? "text-[#FF2638]" : "text-[#333333]"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#999999] mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="e.g. Slept through the night without waking"
                  className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white focus:outline-none focus:border-[#FF2638]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#999999] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,38,56,0.35)] disabled:opacity-50"
                >
                  {submittingManual ? "Saving..." : "Save Sleep Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
