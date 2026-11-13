"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Plus,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
} from "lucide-react";
import confetti from "canvas-confetti";
import CreateHabitModal from "@/components/modals/CreateHabitModal";

interface HabitItem {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDaysPerWeek: number;
  color: string;
  icon: string;
  reminderTime?: string;
  completedToday: boolean;
  currentStreak: number;
  completionRate7d: number;
  last7Days: { date: string; completed: boolean }[];
  totalCompletions: number;
}

interface HabitsResponse {
  todayStr: string;
  habits: HabitItem[];
  stats: {
    totalHabits: number;
    completedTodayCount: number;
    completionPercentageToday: number;
  };
}

export default function HabitsPage() {
  const [data, setData] = useState<HabitsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/habits");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Habits fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleHabit = async (habitId: string) => {
    try {
      const res = await fetch("/api/habits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId }),
      });

      if (res.ok) {
        const resJson = await res.json();
        if (resJson.completed) {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#FF2638", "#B5121B", "#FFFFFF"],
          });
        }
        await fetchData();
      }
    } catch (e) {
      console.error("Toggle habit error:", e);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      const res = await fetch(`/api/habits?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error("Delete habit error:", e);
    }
  };

  const filteredHabits = (data?.habits || []).filter((h) => {
    if (selectedCategory === "all") return true;
    return h.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <CreateHabitModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onHabitCreated={fetchData}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF2638] uppercase tracking-widest">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Spider Habit Matrix & Discipline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Habit Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[#999999] mt-1">
            Build unyielding routines with streak accountability, reminder triggers, and 7-day matrix heatmaps
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,38,56,0.35)] transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Routine</span>
        </button>
      </div>

      {/* COMPLETION HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#151515] border border-[#292929] hover:border-[#FF2638]/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF2638]">
            Today&apos;s Habit Completion
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl sm:text-5xl font-black text-white font-mono">
              {data?.stats.completedTodayCount || 0}
            </span>
            <span className="text-sm text-[#999999]">
              / {data?.stats.totalHabits || 0} routines completed
            </span>
          </div>

          <p className="text-xs text-[#999999] mt-2">
            Daily consistency rate:{" "}
            <span className="text-[#FF2638] font-bold">
              {data?.stats.completionPercentageToday || 0}%
            </span>
          </p>

          <div className="w-full max-w-md bg-[#101010] h-3 rounded-full overflow-hidden mt-4 p-0.5 border border-[#292929]">
            <div
              className="bg-gradient-to-r from-[#B5121B] via-[#FF2638] to-[#B5121B] h-full rounded-full transition-all duration-700 shadow-[0_0_10px_#FF2638]"
              style={{ width: `${data?.stats.completionPercentageToday || 0}%` }}
            />
          </div>
        </div>

        {/* Highest Streak Pill */}
        <div className="flex items-center gap-4 bg-[#101010] border border-[#292929] hover:border-[#FF2638]/40 p-4 rounded-2xl self-start md:self-auto transition-colors">
          <div className="p-3 rounded-xl bg-[#B5121B]/20 text-[#FF2638]">
            <Flame className="w-6 h-6 fill-[#FF2638]" />
          </div>
          <div>
            <p className="text-xs text-[#999999]">Longest Active Streak</p>
            <p className="text-xl font-black text-white font-mono">
              {Math.max(0, ...(data?.habits || []).map((h) => h.currentStreak))} Days 🔥
            </p>
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["all", "wellness", "fitness", "productivity", "mindfulness"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`py-2 px-4 rounded-2xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white shadow-[0_0_12px_rgba(255,38,56,0.35)]"
                : "bg-[#151515] text-[#999999] hover:text-white border border-[#292929]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* HABIT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHabits.map((habit) => (
          <div
            key={habit.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
              habit.completedToday
                ? "bg-[#101010]/80 border-[#292929]"
                : "bg-[#151515] hover:bg-[#1A0507] border-[#292929] hover:border-[#FF2638]/40"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#B5121B]/20 text-[#FF2638] border border-[#FF2638]/30"
                >
                  {habit.category}
                </span>

                <div className="flex items-center gap-2">
                  {habit.reminderTime && (
                    <span className="flex items-center gap-1 text-[11px] text-[#999999]">
                      <Clock className="w-3 h-3 text-[#FF2638]" />
                      {habit.reminderTime}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="p-1 rounded-lg text-[#666666] hover:text-[#FF2638] hover:bg-[#B5121B]/10 transition-colors"
                    title="Delete habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Check Toggle */}
              <div
                onClick={() => handleToggleHabit(habit.id)}
                className="flex items-center gap-3.5 cursor-pointer py-1"
              >
                <div className="shrink-0 transition-transform active:scale-90">
                  {habit.completedToday ? (
                    <CheckCircle2 className="w-7 h-7 text-[#FF2638] drop-shadow-[0_0_8px_#FF2638]" />
                  ) : (
                    <Circle className="w-7 h-7 text-[#666666] hover:text-[#FF2638]" />
                  )}
                </div>
                <div>
                  <h3
                    className={`text-sm font-bold transition-all ${
                      habit.completedToday
                        ? "line-through text-[#666666]"
                        : "text-white"
                    }`}
                  >
                    {habit.title}
                  </h3>
                  {habit.description && (
                    <p className="text-xs text-[#999999] mt-0.5">{habit.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Streak & 7-Day Dots */}
            <div className="pt-4 mt-4 border-t border-[#292929] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF2638]">
                <Flame className="w-4 h-4 fill-[#FF2638]" />
                <span>{habit.currentStreak} day streak</span>
              </div>

              {/* Mini 7-Day dot completion history */}
              <div className="flex items-center gap-1">
                {habit.last7Days.map((d, i) => (
                  <span
                    key={i}
                    title={`${d.date}: ${d.completed ? "Done" : "Missed"}`}
                    className={`w-2.5 h-2.5 rounded-full ${
                      d.completed ? "bg-[#FF2638] shadow-[0_0_6px_#FF2638]" : "bg-[#292929]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* WEEKLY MATRIX HEATMAP TABLE */}
      <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929] overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">7-Day Consistency Matrix</h3>
            <p className="text-xs text-[#999999]">Visual breakdown of habit execution across the past week</p>
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#292929] text-[#999999]">
              <th className="pb-3 font-semibold min-w-[160px]">Habit</th>
              {(data?.habits[0]?.last7Days || []).map((d) => (
                <th key={d.date} className="pb-3 text-center font-semibold px-2">
                  {new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })}
                </th>
              ))}
              <th className="pb-3 text-right font-semibold">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#292929]">
            {(data?.habits || []).map((h) => (
              <tr key={h.id} className="hover:bg-[#101010]">
                <td className="py-3 font-semibold text-white truncate pr-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF2638]" />
                    <span className="truncate">{h.title}</span>
                  </div>
                </td>
                {h.last7Days.map((d) => (
                  <td key={d.date} className="py-3 text-center px-2">
                    {d.completed ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-[#B5121B]/20 text-[#FF2638] text-xs font-bold border border-[#FF2638]/40 shadow-[0_0_6px_rgba(255,38,56,0.3)]">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-[#101010] text-[#666666] text-xs">
                        ·
                      </span>
                    )}
                  </td>
                ))}
                <td className="py-3 text-right font-bold text-[#FF2638] font-mono">
                  {h.completionRate7d}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
