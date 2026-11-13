"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSleep } from "@/context/SleepContext";
import {
  Moon,
  Activity,
  Utensils,
  Smartphone,
  CheckSquare,
  Droplets,
  Flame,
  Footprints,
  Plus,
  Play,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Circle,
  Award,
  Layers,
  Settings as SettingsIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import confetti from "canvas-confetti";
import LogActivityModal from "@/components/modals/LogActivityModal";
import LogFoodModal from "@/components/modals/LogFoodModal";
import FocusTimerModal from "@/components/modals/FocusTimerModal";
import WebSpinner from "@/components/common/WebSpinner";
import SleepPage from "@/app/sleep/page";
import ActivityPage from "@/app/activity/page";
import NutritionPage from "@/app/nutrition/page";
import ScreenTimePage from "@/app/screen-time/page";
import HabitsPage from "@/app/habits/page";
import AnalyticsPage from "@/app/analytics/page";
import SettingsPage from "@/app/settings/page";

interface OverviewData {
  user: { name: string; email: string };
  todayStr: string;
  sleep: {
    isSleeping: boolean;
    activeSession: { startTime: string; elapsedSeconds: number } | null;
    lastSession: { durationHours: number; qualityRating: number; sleepConsistency: number } | null;
    targetHours: number;
  };
  steps: {
    current: number;
    goal: number;
    distanceKm: number;
    caloriesBurned: number;
    progress: number;
  };
  nutrition: {
    calories: number;
    calorieGoal: number;
    protein: number;
    proteinGoal: number;
    carbs: number;
    carbsGoal: number;
    fat: number;
    fatGoal: number;
    fiber: number;
    waterMl: number;
    waterGoalMl: number;
  };
  screenTime: {
    totalMinutes: number;
    totalHours: number;
    limitMinutes: number;
    limitHours: number;
    productivityRatio: number;
  };
  habits: {
    total: number;
    completed: number;
    list: { id: string; title: string; category: string; color: string; completedToday: boolean }[];
  };
  weeklyTrends: { day: string; date: string; steps: number; calories: number }[];
}

const TABS = [
  { id: "all", label: "🌟 All-in-One Website", icon: Layers, isHub: true },
  { id: "overview", label: "Overview", icon: Award },
  { id: "sleep", label: "Sleep Tracker", icon: Moon },
  { id: "activity", label: "Activity & Steps", icon: Activity },
  { id: "nutrition", label: "Nutrition & Macros", icon: Utensils },
  { id: "screen-time", label: "Screen Time", icon: Smartphone },
  { id: "habits", label: "Habit Tracker", icon: CheckSquare },
  { id: "analytics", label: "Analytics & Trends", icon: Sparkles },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function OverviewPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isSleeping, startSleep, setShowSleepOverlay } = useSleep();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingWater, setAddingWater] = useState(false);
  const [googleAuthToast, setGoogleAuthToast] = useState("");

  // Modals
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showFocusModal, setShowFocusModal] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch("/api/overview");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Overview fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    const handleUrlChange = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("googleAuth") === "success") {
          setGoogleAuthToast("Google Account verified and connected! Welcome to LifeSync.");
          setTimeout(() => setGoogleAuthToast(""), 5000);
        }
        const tabParam = params.get("tab");
        if (tabParam && TABS.some((t) => t.id === tabParam)) {
          setActiveTab(tabParam);
        } else if (window.location.hash) {
          const hash = window.location.hash.replace("#", "");
          if (TABS.some((t) => t.id === hash)) {
            setActiveTab(hash);
          }
        }
      }
    };

    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, [fetchOverview]);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tabId === "all") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tabId);
      }
      window.history.replaceState({}, "", url.toString());

      if (tabId === "all") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const el = document.getElementById(tabId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const handleQuickAddWater = async (amount = 250) => {
    setAddingWater(true);
    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMl: amount }),
      });
      if (res.ok) {
        await fetchOverview();
      }
    } catch (err) {
      console.error("Water add error:", err);
    } finally {
      setAddingWater(false);
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    try {
      const res = await fetch("/api/habits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId }),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.completed) {
          try {
            confetti({
              particleCount: 45,
              spread: 60,
              origin: { y: 0.7 },
              colors: ["#FF2638", "#B5121B", "#FFFFFF"],
            });
          } catch {
            // ignore
          }
        }
        await fetchOverview();
      }
    } catch (e) {
      console.error("Toggle habit error:", e);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (authLoading || loading || !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <WebSpinner size={54} className="mb-4" />
        <p className="text-[#999999] text-xs font-semibold tracking-wider uppercase">
          Synthesizing Spider Matrix...
        </p>
      </div>
    );
  }

  // Calculate composite Health Sync score (0-100)
  const sleepPts = data.sleep.lastSession?.durationHours
    ? Math.min(25, Math.round((data.sleep.lastSession.durationHours / 8) * 25))
    : 20;
  const stepPts = Math.min(25, Math.round((data.steps.current / data.steps.goal) * 25));
  const nutritionPts = data.nutrition.calories > 0 ? 20 : 12;
  const habitPts = data.habits.total > 0
    ? Math.round((data.habits.completed / data.habits.total) * 15)
    : 10;
  const screenPts = data.screenTime.totalMinutes <= data.screenTime.limitMinutes ? 15 : 10;
  const wellnessScore = Math.min(100, sleepPts + stepPts + nutritionPts + habitPts + screenPts);

  const renderOverviewSection = () => (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Quick Action Modals */}
      <LogActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onActivityLogged={fetchOverview}
      />
      <LogFoodModal
        isOpen={showFoodModal}
        onClose={() => setShowFoodModal(false)}
        onFoodLogged={fetchOverview}
      />
      <FocusTimerModal
        isOpen={showFocusModal}
        onClose={() => setShowFocusModal(false)}
        onSessionComplete={fetchOverview}
      />

      {/* Google Auth Success Toast */}
      {googleAuthToast && (
        <div className="p-3.5 rounded-2xl bg-[#34A853]/15 border border-[#34A853]/40 text-[#34A853] text-xs font-bold flex items-center justify-between shadow-[0_0_15px_rgba(52,168,83,0.3)] animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
            <span>{googleAuthToast}</span>
          </div>
          <button
            onClick={() => setGoogleAuthToast("")}
            className="text-xs text-[#999999] hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* TOP HEADER: Greeting, Date & Wellness Score */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF2638] uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#FF2638] shadow-[0_0_8px_#FF2638]" />
            <span>Spider Web Wellness Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            {getGreeting()},{" "}
            <span className="text-gradient-red font-extrabold">
              {data.user?.name || "Operative"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#999999] mt-1">{formattedDate}</p>
        </div>

        {/* Health Sync Composite Score Badge with Neon Red Glow */}
        <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-[#151515] border border-[#292929] hover:border-[#FF2638]/50 shadow-[0_4px_24px_rgba(0,0,0,0.8)] transition-all">
          <div className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#B5121B] to-[#FF2638] font-mono text-xl font-black text-white shadow-[0_0_15px_rgba(255,38,56,0.5)]">
            {wellnessScore}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Award className="w-4 h-4 text-[#FF2638]" />
              <span>LifeSync Health Score</span>
            </div>
            <p className="text-[11px] text-[#999999]">
              {wellnessScore >= 85 ? "Optimal Vitality Sync" : "Circadian Discipline Building"}
            </p>
          </div>
          <Link
            href="/analytics"
            className="p-1.5 rounded-lg bg-[#101010] hover:bg-[#B5121B]/20 text-[#FF2638] transition-colors ml-2 border border-[#292929]"
            title="View full analytics"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* HERO QUICK ACTIONS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Sleep Action */}
        <button
          onClick={() => {
            if (isSleeping) {
              setShowSleepOverlay(true);
            } else {
              startSleep();
            }
          }}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
            isSleeping
              ? "bg-[#1A0507] border-[#FF2638] text-[#FF2638] shadow-[0_0_18px_rgba(255,38,56,0.35)]"
              : "bg-[#151515] hover:bg-[#1A0507] border-[#292929] hover:border-[#FF2638]/50 text-[#F5F5F5]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638] group-hover:scale-110 transition-transform">
              <Moon className="w-4 h-4" />
            </div>
            {isSleeping && <span className="w-2 h-2 rounded-full bg-[#FF2638] animate-ping" />}
          </div>
          <div>
            <p className="text-xs font-bold text-white">
              {isSleeping ? "Active Sleep Mode" : "Start Sleep Mode"}
            </p>
            <p className="text-[11px] text-[#999999]">
              {isSleeping ? "Open dark sanctuary" : "Begin live rest tracking"}
            </p>
          </div>
        </button>

        {/* Activity Action */}
        <button
          onClick={() => setShowActivityModal(true)}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#151515] hover:bg-[#1A0507] border border-[#292929] hover:border-[#FF2638]/50 text-[#F5F5F5] text-left transition-all group flex flex-col justify-between"
        >
          <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638] w-fit mb-2 group-hover:scale-110 transition-transform">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Log Workout</p>
            <p className="text-[11px] text-[#999999]">Walk, run, cycling, gym</p>
          </div>
        </button>

        {/* Meal Action */}
        <button
          onClick={() => setShowFoodModal(true)}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#151515] hover:bg-[#1A0507] border border-[#292929] hover:border-[#FF2638]/50 text-[#F5F5F5] text-left transition-all group flex flex-col justify-between"
        >
          <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638] w-fit mb-2 group-hover:scale-110 transition-transform">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Log Meal</p>
            <p className="text-[11px] text-[#999999]">Calories & macros</p>
          </div>
        </button>

        {/* Focus Action */}
        <button
          onClick={() => setShowFocusModal(true)}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#151515] hover:bg-[#1A0507] border border-[#292929] hover:border-[#FF2638]/50 text-[#F5F5F5] text-left transition-all group flex flex-col justify-between"
        >
          <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638] w-fit mb-2 group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Focus Timer</p>
            <p className="text-[11px] text-[#999999]">Pomodoro & flow</p>
          </div>
        </button>
      </div>

      {/* METRIC GLANCE CARDS: 6 Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 1. SLEEP CARD */}
        <div className="spider-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638]">
                <Moon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">Sleep Tracker</span>
            </div>
            <Link href="/sleep" className="text-xs text-[#FF2638] hover:underline flex items-center gap-1 font-semibold">
              <span>Sanctuary</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">
                {data.sleep.lastSession ? data.sleep.lastSession.durationHours : "0.0"}
              </span>
              <span className="text-[#999999] text-sm">hours slept</span>
            </div>
            <p className="text-xs text-[#999999] mt-1">
              Target: {data.sleep.targetHours}h &bull; Consistency:{" "}
              <span className="text-[#FF2638] font-bold">
                {data.sleep.lastSession ? `${data.sleep.lastSession.sleepConsistency}%` : "0%"}
              </span>
            </p>
          </div>

          <div className="pt-3 border-t border-[#292929] flex items-center justify-between text-xs">
            <span className="text-[#999999]">Quality Rating</span>
            <span className="text-[#FF2638] font-bold">
              {data.sleep.lastSession?.qualityRating ? (
                <>
                  {"★".repeat(data.sleep.lastSession.qualityRating)}
                  {"☆".repeat(5 - data.sleep.lastSession.qualityRating)}
                </>
              ) : (
                <span className="text-[#666666] font-normal">No rest logged yet</span>
              )}
            </span>
          </div>
        </div>

        {/* 2. ACTIVITY & STEPS CARD */}
        <div className="spider-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638]">
                <Footprints className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">Daily Steps</span>
            </div>
            <Link href="/activity" className="text-xs text-[#FF2638] hover:underline flex items-center gap-1 font-semibold">
              <span>Steps</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">
                {data.steps.current.toLocaleString()}
              </span>
              <span className="text-[#999999] text-sm">/ {data.steps.goal.toLocaleString()}</span>
            </div>
            <div className="w-full bg-[#101010] h-2 rounded-full overflow-hidden mt-3 border border-[#292929]">
              <div
                className="bg-gradient-to-r from-[#B5121B] to-[#FF2638] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#FF2638]"
                style={{ width: `${Math.min(100, data.steps.progress)}%` }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#292929] flex items-center justify-between text-xs text-[#999999]">
            <span>{data.steps.distanceKm} km distance</span>
            <span className="text-[#FF2638] font-bold">{data.steps.caloriesBurned} kcal</span>
          </div>
        </div>

        {/* 3. NUTRITION & CALORIES CARD */}
        <div className="spider-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638]">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">Nutrition</span>
            </div>
            <Link href="/nutrition" className="text-xs text-[#FF2638] hover:underline flex items-center gap-1 font-semibold">
              <span>Diary</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">
                {data.nutrition.calories.toLocaleString()}
              </span>
              <span className="text-[#999999] text-sm">/ {data.nutrition.calorieGoal} kcal</span>
            </div>
            {/* Macro bars */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
              <div>
                <span className="text-[#F5F5F5] font-semibold">P: {data.nutrition.protein}g</span>
                <div className="w-full bg-[#101010] h-1.5 rounded-full mt-1 border border-[#292929]">
                  <div
                    className="bg-[#FF2638] h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (data.nutrition.protein / data.nutrition.proteinGoal) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <span className="text-[#F5F5F5] font-semibold">C: {data.nutrition.carbs}g</span>
                <div className="w-full bg-[#101010] h-1.5 rounded-full mt-1 border border-[#292929]">
                  <div
                    className="bg-[#B5121B] h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (data.nutrition.carbs / data.nutrition.carbsGoal) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <span className="text-[#F5F5F5] font-semibold">F: {data.nutrition.fat}g</span>
                <div className="w-full bg-[#101010] h-1.5 rounded-full mt-1 border border-[#292929]">
                  <div
                    className="bg-[#7A0C12] h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (data.nutrition.fat / data.nutrition.fatGoal) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#292929] flex items-center justify-between text-xs text-[#999999]">
            <span>Fiber: {data.nutrition.fiber}g</span>
            <span className="text-[#FF2638] font-bold">Macro Ratio On Track</span>
          </div>
        </div>

        {/* 4. WATER INTAKE CARD */}
        <div className="spider-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638]">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">Hydration</span>
            </div>
            <button
              onClick={() => handleQuickAddWater(250)}
              disabled={addingWater}
              className="px-2.5 py-1 rounded-xl bg-[#B5121B]/20 hover:bg-[#FF2638]/30 text-[#FF2638] text-xs font-bold transition-colors flex items-center gap-1 border border-[#FF2638]/40"
            >
              <Plus className="w-3 h-3" />
              <span>+250ml</span>
            </button>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">
                {data.nutrition.waterMl.toLocaleString()}
              </span>
              <span className="text-[#999999] text-sm">/ {data.nutrition.waterGoalMl} ml</span>
            </div>
            <div className="w-full bg-[#101010] h-2 rounded-full overflow-hidden mt-3 border border-[#292929]">
              <div
                className="bg-gradient-to-r from-[#B5121B] to-[#FF2638] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#FF2638]"
                style={{
                  width: `${Math.min(100, Math.round((data.nutrition.waterMl / data.nutrition.waterGoalMl) * 100))}%`,
                }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#292929] flex items-center justify-between text-xs text-[#999999]">
            <span>{Math.round((data.nutrition.waterMl / data.nutrition.waterGoalMl) * 100)}% completed</span>
            <span>{Math.max(0, data.nutrition.waterGoalMl - data.nutrition.waterMl)} ml remaining</span>
          </div>
        </div>

        {/* 5. SCREEN TIME CARD */}
        <div className="spider-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638]">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">Screen Time</span>
            </div>
            <Link href="/screen-time" className="text-xs text-[#FF2638] hover:underline flex items-center gap-1 font-semibold">
              <span>Shield</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">
                {data.screenTime.totalHours}
              </span>
              <span className="text-[#999999] text-sm">/ {data.screenTime.limitHours} hrs max</span>
            </div>
            <div className="w-full bg-[#101010] h-2 rounded-full overflow-hidden mt-3 border border-[#292929]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  data.screenTime.totalMinutes > data.screenTime.limitMinutes
                    ? "bg-[#FF2638] shadow-[0_0_10px_#FF2638]"
                    : "bg-gradient-to-r from-[#B5121B] to-[#FF2638]"
                }`}
                style={{
                  width: `${Math.min(100, (data.screenTime.totalMinutes / data.screenTime.limitMinutes) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#292929] flex items-center justify-between text-xs text-[#999999]">
            <span>Productive Ratio:</span>
            <span className="text-[#FF2638] font-bold">{data.screenTime.productivityRatio}%</span>
          </div>
        </div>

        {/* 6. HABIT TRACKER CARD */}
        <div className="spider-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638]">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">Daily Routines</span>
            </div>
            <Link href="/habits" className="text-xs text-[#FF2638] hover:underline flex items-center gap-1 font-semibold">
              <span>Matrix</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">
                {data.habits.completed}
              </span>
              <span className="text-[#999999] text-sm">/ {data.habits.total} completed</span>
            </div>
            <div className="w-full bg-[#101010] h-2 rounded-full overflow-hidden mt-3 border border-[#292929]">
              <div
                className="bg-gradient-to-r from-[#B5121B] to-[#FF2638] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#FF2638]"
                style={{
                  width: `${data.habits.total > 0 ? (data.habits.completed / data.habits.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#292929] flex items-center justify-between text-xs text-[#999999]">
            <span>
              {data.habits.total > 0
                ? `${Math.round((data.habits.completed / data.habits.total) * 100)}% completed`
                : "No habits set"}
            </span>
            <span className="text-[#FF2638] font-bold">🔥 Active Streaks</span>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Weekly Trends Chart & Today's Habit Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Performance Trends (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#151515] border border-[#292929]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Weekly Performance Trends</h3>
              <p className="text-xs text-[#999999]">Steps trajectory across the last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF2638] shadow-[0_0_8px_#FF2638] inline-block" />
                <span className="text-white font-semibold">Steps</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#666666" fontSize={11} tickLine={false} />
                <YAxis stroke="#666666" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#101010",
                    borderColor: "#292929",
                    borderRadius: "12px",
                    color: "#FFF",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="steps" fill="#FF2638" radius={[6, 6, 0, 0]} name="Steps" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Priority Checklist (1 col) */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Today&apos;s Checklist</h3>
              <Link href="/habits" className="text-xs text-[#FF2638] hover:underline font-bold">
                View matrix
              </Link>
            </div>

            <div className="space-y-2.5">
              {data.habits.list.slice(0, 5).map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => handleToggleHabit(habit.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    habit.completedToday
                      ? "bg-[#101010]/80 border-[#292929] text-[#666666]"
                      : "bg-[#101010] hover:bg-[#1A0507] border-[#292929] hover:border-[#FF2638]/50 text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate pr-2">
                    {habit.completedToday ? (
                      <CheckCircle2 className="w-5 h-5 text-[#FF2638] flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#666666] hover:text-[#FF2638] flex-shrink-0" />
                    )}
                    <span className={`text-xs font-semibold truncate ${habit.completedToday ? "line-through text-[#666666]" : "text-white"}`}>
                      {habit.title}
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full shrink-0 bg-[#FF2638]" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#292929] mt-4">
            <button
              onClick={() => handleSelectTab("habits")}
              className="w-full py-2.5 px-3 rounded-xl bg-[#101010] hover:bg-[#1A1A1A] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#292929] hover:border-[#FF2638]/40"
            >
              <span>Manage Habits & Streaks</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#FF2638]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* UNIFIED ALL-IN-ONE TAB BAR */}
      <div className="sticky top-16 z-20 py-2.5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-[#080808]/90 backdrop-blur-xl border-b border-[#292929]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none max-w-7xl mx-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white shadow-[0_0_16px_rgba(255,38,56,0.4)] border border-[#FF2638]/60"
                    : "bg-[#151515] text-[#999999] hover:text-white hover:border-[#FF2638]/40 border border-[#292929]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#FF2638]"}`} />
                <span>{tab.label}</span>
                {tab.isHub && (
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] uppercase tracking-wider text-white font-extrabold ml-1">
                    Hub
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT BASED ON ACTIVE TAB */}
      {activeTab === "all" ? (
        <div className="space-y-16">
          {/* 1. OVERVIEW */}
          <section id="overview" className="scroll-mt-36">
            {renderOverviewSection()}
          </section>

          {/* SECTION DIVIDER */}
          <div className="relative flex items-center justify-between py-3 border-t border-[#292929]">
            <div className="flex items-center gap-2 text-xs font-black text-[#FF2638] uppercase tracking-widest">
              <Moon className="w-4 h-4" />
              <span>02 &bull; Sleep Sanctuary & Circadian Rhythm</span>
            </div>
            <button
              onClick={() => handleSelectTab("sleep")}
              className="text-xs text-[#999999] hover:text-[#FF2638] font-bold"
            >
              Focus this section &rarr;
            </button>
          </div>

          {/* 2. SLEEP TRACKER */}
          <section id="sleep" className="scroll-mt-36">
            <SleepPage />
          </section>

          {/* SECTION DIVIDER */}
          <div className="relative flex items-center justify-between py-3 border-t border-[#292929]">
            <div className="flex items-center gap-2 text-xs font-black text-[#FF2638] uppercase tracking-widest">
              <Activity className="w-4 h-4" />
              <span>03 &bull; Physical Activity & Step Tracking</span>
            </div>
            <button
              onClick={() => handleSelectTab("activity")}
              className="text-xs text-[#999999] hover:text-[#FF2638] font-bold"
            >
              Focus this section &rarr;
            </button>
          </div>

          {/* 3. ACTIVITY & STEPS */}
          <section id="activity" className="scroll-mt-36">
            <ActivityPage />
          </section>

          {/* SECTION DIVIDER */}
          <div className="relative flex items-center justify-between py-3 border-t border-[#292929]">
            <div className="flex items-center gap-2 text-xs font-black text-[#FF2638] uppercase tracking-widest">
              <Utensils className="w-4 h-4" />
              <span>04 &bull; Nutrition Diary & Caloric Intake</span>
            </div>
            <button
              onClick={() => handleSelectTab("nutrition")}
              className="text-xs text-[#999999] hover:text-[#FF2638] font-bold"
            >
              Focus this section &rarr;
            </button>
          </div>

          {/* 4. NUTRITION */}
          <section id="nutrition" className="scroll-mt-36">
            <NutritionPage />
          </section>

          {/* SECTION DIVIDER */}
          <div className="relative flex items-center justify-between py-3 border-t border-[#292929]">
            <div className="flex items-center gap-2 text-xs font-black text-[#FF2638] uppercase tracking-widest">
              <Smartphone className="w-4 h-4" />
              <span>05 &bull; Screen Time & Focus Shield</span>
            </div>
            <button
              onClick={() => handleSelectTab("screen-time")}
              className="text-xs text-[#999999] hover:text-[#FF2638] font-bold"
            >
              Focus this section &rarr;
            </button>
          </div>

          {/* 5. SCREEN TIME */}
          <section id="screen-time" className="scroll-mt-36">
            <ScreenTimePage />
          </section>

          {/* SECTION DIVIDER */}
          <div className="relative flex items-center justify-between py-3 border-t border-[#292929]">
            <div className="flex items-center gap-2 text-xs font-black text-[#FF2638] uppercase tracking-widest">
              <CheckSquare className="w-4 h-4" />
              <span>06 &bull; Daily Habit Tracker & Streaks</span>
            </div>
            <button
              onClick={() => handleSelectTab("habits")}
              className="text-xs text-[#999999] hover:text-[#FF2638] font-bold"
            >
              Focus this section &rarr;
            </button>
          </div>

          {/* 6. HABITS */}
          <section id="habits" className="scroll-mt-36">
            <HabitsPage />
          </section>

          {/* SECTION DIVIDER */}
          <div className="relative flex items-center justify-between py-3 border-t border-[#292929]">
            <div className="flex items-center gap-2 text-xs font-black text-[#FF2638] uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>07 &bull; Deep Analytics & Performance Trends</span>
            </div>
            <button
              onClick={() => handleSelectTab("analytics")}
              className="text-xs text-[#999999] hover:text-[#FF2638] font-bold"
            >
              Focus this section &rarr;
            </button>
          </div>

          {/* 7. ANALYTICS */}
          <section id="analytics" className="scroll-mt-36">
            <AnalyticsPage />
          </section>

          {/* SECTION DIVIDER */}
          <div className="relative flex items-center justify-between py-3 border-t border-[#292929]">
            <div className="flex items-center gap-2 text-xs font-black text-[#FF2638] uppercase tracking-widest">
              <SettingsIcon className="w-4 h-4" />
              <span>08 &bull; Biometric Settings & Preferences</span>
            </div>
            <button
              onClick={() => handleSelectTab("settings")}
              className="text-xs text-[#999999] hover:text-[#FF2638] font-bold"
            >
              Focus this section &rarr;
            </button>
          </div>

          {/* 8. SETTINGS */}
          <section id="settings" className="scroll-mt-36">
            <SettingsPage />
          </section>
        </div>
      ) : activeTab === "overview" ? (
        renderOverviewSection()
      ) : activeTab === "sleep" ? (
        <SleepPage />
      ) : activeTab === "activity" ? (
        <ActivityPage />
      ) : activeTab === "nutrition" ? (
        <NutritionPage />
      ) : activeTab === "screen-time" ? (
        <ScreenTimePage />
      ) : activeTab === "habits" ? (
        <HabitsPage />
      ) : activeTab === "analytics" ? (
        <AnalyticsPage />
      ) : (
        <SettingsPage />
      )}
    </div>
  );
}
