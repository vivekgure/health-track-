"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Footprints,
  Flame,
  MapPin,
  Plus,
  Award,
  Trash2,
  HeartPulse,
  Smartphone,
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
import LogActivityModal from "@/components/modals/LogActivityModal";

interface StepData {
  today: {
    steps: number;
    goal: number;
    distanceKm: number;
    caloriesBurned: number;
  };
  history: {
    date: string;
    steps: number;
    goal: number;
    distanceKm: number;
    caloriesBurned: number;
  }[];
}

interface ActivityRecord {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
  distanceKm: number;
  caloriesBurned: number;
  steps: number;
  notes: string;
}

export default function ActivityPage() {
  const [stepData, setStepData] = useState<StepData | null>(null);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & controls
  const [showLogModal, setShowLogModal] = useState(false);
  const [manualStepsInput, setManualStepsInput] = useState("");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState(10000);
  const [submittingSteps, setSubmittingSteps] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [stepRes, actRes] = await Promise.all([
        fetch("/api/steps"),
        fetch("/api/activity"),
      ]);

      if (stepRes.ok) {
        const sJson = await stepRes.json();
        setStepData(sJson);
        setNewGoal(sJson.today?.goal || 10000);
      }

      if (actRes.ok) {
        const aJson = await actRes.json();
        setActivities(aJson.activities || []);
      }
    } catch (err) {
      console.error("Activity fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleQuickAddSteps = async (stepsToAdd: number) => {
    setSubmittingSteps(true);
    try {
      const res = await fetch("/api/steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: stepsToAdd, setAbsolute: false }),
      });
      if (res.ok) {
        await fetchData();
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#FF2638", "#B5121B", "#FFFFFF"],
        });
      }
    } catch (e) {
      console.error("Add steps error:", e);
    } finally {
      setSubmittingSteps(false);
    }
  };

  const handleSetExactSteps = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(manualStepsInput, 10);
    if (isNaN(count) || count < 0) return;

    setSubmittingSteps(true);
    try {
      const res = await fetch("/api/steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: count, setAbsolute: true }),
      });
      if (res.ok) {
        setManualStepsInput("");
        await fetchData();
      }
    } catch (e) {
      console.error("Set steps error:", e);
    } finally {
      setSubmittingSteps(false);
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepGoal: newGoal }),
      });
      setShowGoalModal(false);
      await fetchData();
    } catch (e) {
      console.error("Update goal error:", e);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      const res = await fetch(`/api/activity?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error("Delete activity error:", e);
    }
  };

  const todaySteps = stepData?.today.steps || 0;
  const todayGoal = stepData?.today.goal || 10000;
  const progressPercent = Math.min(100, Math.round((todaySteps / todayGoal) * 100));

  // Chart data
  const stepChartData = (stepData?.history || []).map((h) => ({
    date: new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    steps: h.steps,
    calories: h.caloriesBurned,
    distance: h.distanceKm,
  }));

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <LogActivityModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onActivityLogged={fetchData}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF2638] uppercase tracking-widest">
            <Footprints className="w-3.5 h-3.5" />
            <span>Physical Activity & Steps Trajectory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Activity Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[#999999] mt-1">
            Monitor daily steps, cardio workouts, active calories, and health sync integrations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowGoalModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-[#151515] hover:bg-[#1A1A1A] text-white text-xs font-semibold border border-[#292929] hover:border-[#FF2638]/40 transition-colors"
          >
            Edit Goal ({todayGoal.toLocaleString()})
          </button>
          <button
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,38,56,0.35)] transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Activity</span>
          </button>
        </div>
      </div>

      {/* HERO STEP COUNTER & QUICK LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Step Ring & Progress Card */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#151515] border border-[#292929] hover:border-[#FF2638]/40 shadow-xl flex flex-col justify-between transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF2638]">
                Today&apos;s Step Count
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                  {todaySteps.toLocaleString()}
                </span>
                <span className="text-sm text-[#999999]">
                  / {todayGoal.toLocaleString()} steps
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-[#999999]">Goal Progress</p>
                <p className="text-lg font-black text-[#FF2638]">{progressPercent}%</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#B5121B]/20 border border-[#FF2638]/40 flex items-center justify-center text-[#FF2638] shadow-[0_0_12px_rgba(255,38,56,0.25)]">
                <Award className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Progress bar with neon red glow */}
          <div className="w-full bg-[#101010] h-3.5 rounded-full overflow-hidden mb-6 p-0.5 border border-[#292929]">
            <div
              className="bg-gradient-to-r from-[#B5121B] via-[#FF2638] to-[#B5121B] h-full rounded-full transition-all duration-700 shadow-[0_0_10px_#FF2638]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Metric Sub-cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#101010] border border-[#292929]">
              <div className="flex items-center gap-1.5 text-xs text-[#999999] mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF2638]" />
                <span>Distance</span>
              </div>
              <p className="text-base font-bold text-white font-mono">
                {stepData?.today.distanceKm || 0} km
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#101010] border border-[#292929]">
              <div className="flex items-center gap-1.5 text-xs text-[#999999] mb-1">
                <Flame className="w-3.5 h-3.5 text-[#FF2638]" />
                <span>Active Burn</span>
              </div>
              <p className="text-base font-bold text-[#FF2638] font-mono">
                {stepData?.today.caloriesBurned || 0} kcal
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#101010] border border-[#292929]">
              <div className="flex items-center gap-1.5 text-xs text-[#999999] mb-1">
                <Footprints className="w-3.5 h-3.5 text-[#FF2638]" />
                <span>Remaining</span>
              </div>
              <p className="text-base font-bold text-white font-mono">
                {Math.max(0, todayGoal - todaySteps).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Add & Manual Step Entry */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Spider Quick Step Logger</h3>
            <p className="text-xs text-[#999999] mb-4">
              Tap to add steps from pedometer or treadmill
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[500, 1000, 2500].map((stepInc) => (
                <button
                  key={stepInc}
                  type="button"
                  disabled={submittingSteps}
                  onClick={() => handleQuickAddSteps(stepInc)}
                  className="py-2.5 px-2 rounded-xl bg-[#101010] hover:bg-[#1A0507] text-white border border-[#292929] hover:border-[#FF2638]/50 text-xs font-bold transition-all shadow-sm"
                >
                  +{stepInc.toLocaleString()}
                </button>
              ))}
            </div>

            <form onSubmit={handleSetExactSteps} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#999999] mb-1">
                  Or Set Exact Total Steps
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10450"
                    value={manualStepsInput}
                    onChange={(e) => setManualStepsInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
                  />
                  <button
                    type="submit"
                    disabled={submittingSteps || !manualStepsInput}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white font-bold text-xs shadow-[0_0_10px_rgba(255,38,56,0.3)] transition-colors disabled:opacity-50"
                  >
                    Set
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="pt-4 border-t border-[#292929] mt-4 text-[11px] text-[#999999] flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#FF2638] shrink-0" />
            <span>Estimated stride: 0.78m &bull; Burn: ~45 kcal/k-steps</span>
          </div>
        </div>
      </div>

      {/* STEP & CALORIE CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Steps History */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">14-Day Step History</h3>
              <p className="text-xs text-[#999999]">Daily steps vs 10,000 goal line</p>
            </div>
            <span className="text-xs font-bold text-[#FF2638]">Steps</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stepChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#666666" fontSize={10} tickLine={false} />
                <YAxis stroke="#666666" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#101010",
                    borderColor: "#292929",
                    borderRadius: "12px",
                    color: "#FFF",
                    fontSize: "12px",
                  }}
                />
                <ReferenceLine y={todayGoal} stroke="#FF2638" strokeDasharray="3 3" />
                <Bar dataKey="steps" fill="#FF2638" radius={[4, 4, 0, 0]} name="Steps" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calories Burned Chart */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Active Calories Burned</h3>
              <p className="text-xs text-[#999999]">Daily calorie expenditure trajectory</p>
            </div>
            <span className="text-xs font-bold text-[#FF2638]">kcal</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stepChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#666666" fontSize={10} tickLine={false} />
                <YAxis stroke="#666666" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#101010",
                    borderColor: "#292929",
                    borderRadius: "12px",
                    color: "#FFF",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="calories" stroke="#FF2638" strokeWidth={2.5} dot={{ fill: "#FF2638", r: 3 }} name="Burned (kcal)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LOGGED ACTIVITIES LIST */}
      <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Workout & Physical Activity Log</h3>
          <span className="text-xs text-[#999999]">{activities.length} sessions recorded</span>
        </div>

        {activities.length === 0 ? (
          <div className="py-12 text-center text-[#999999]">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#FF2638]" />
            <p className="text-sm font-medium">No workouts logged yet</p>
            <p className="text-xs mt-1">Click &quot;Log Activity&quot; to add your walk, run, or gym session.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl bg-[#101010] hover:bg-[#1A0507] border border-[#292929] hover:border-[#FF2638]/40 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#FF2638]">{act.type}</span>
                    <span className="text-[#666666]">•</span>
                    <span className="text-xs text-[#999999]">{act.date}</span>
                  </div>
                  <p className="text-sm font-bold text-white mt-1">
                    {act.durationMinutes} mins &bull; {act.caloriesBurned} kcal
                    {act.distanceKm > 0 && ` • ${act.distanceKm} km`}
                  </p>
                  {act.notes && (
                    <p className="text-xs text-[#999999] mt-1 italic">&ldquo;{act.notes}&rdquo;</p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteActivity(act.id)}
                  className="p-2 rounded-xl hover:bg-rose-500/20 text-[#666666] hover:text-[#FF2638] transition-colors"
                  title="Delete activity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STEP GOAL MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#151515] border border-[#292929] rounded-3xl p-6 max-w-sm w-full text-[#F5F5F5]">
            <h3 className="text-base font-bold text-white mb-2">Adjust Daily Step Goal</h3>
            <p className="text-xs text-[#999999] mb-4">
              Set a target that motivates your physical vitality.
            </p>

            <form onSubmit={handleUpdateGoal} className="space-y-4">
              <div>
                <input
                  type="number"
                  step="500"
                  min="1000"
                  max="50000"
                  value={newGoal}
                  onChange={(e) => setNewGoal(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white focus:outline-none focus:border-[#FF2638]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs text-[#999999] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white font-bold text-xs"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
