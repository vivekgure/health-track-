"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Download,
  Printer,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";

interface ScoreBreakdownItem {
  score: number;
  max: number;
  label: string;
}

interface AnalyticsData {
  rangeDays: number;
  compositeScore: number;
  scoreBreakdown: {
    sleepScore: ScoreBreakdownItem;
    activityScore: ScoreBreakdownItem;
    nutritionScore: ScoreBreakdownItem;
    habitScore: ScoreBreakdownItem;
    screenScore: ScoreBreakdownItem;
  };
  summary: {
    avgSleepHours: number;
    sleepTargetHours: number;
    avgSteps: number;
    stepGoal: number;
    totalDistance: number;
    totalCaloriesBurned: number;
    avgCalories: number;
    calorieGoal: number;
    avgScreenMinutes: number;
    avgScreenHours: number;
    screenTimeLimitMinutes: number;
    avgHabitRate: number;
  };
  timeline: {
    date: string;
    dayLabel: string;
    sleepHours: number;
    sleepQuality: number;
    steps: number;
    caloriesBurned: number;
    caloriesConsumed: number;
    proteinConsumed: number;
    screenMinutes: number;
    screenHours: number;
    productiveScreenMinutes: number;
    habitRate: number;
  }[];
}

export default function AnalyticsPage() {
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(7);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics?days=${rangeDays}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [rangeDays]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF2638] uppercase tracking-widest">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Advanced Spider Reports & Cross-Pillar Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Wellness Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#999999] mt-1">
            Aggregated cross-domain insights for sleep, activity, nutrition, and discipline
          </p>
        </div>

        {/* Action Buttons: Time range, Export, Print */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-[#151515] border border-[#292929] p-1 rounded-2xl">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setRangeDays(d as 7 | 30 | 90)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  rangeDays === d
                    ? "bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white shadow-[0_0_10px_rgba(255,38,56,0.3)]"
                    : "text-[#999999] hover:text-white"
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>

          <a
            href="/api/export"
            download
            className="px-3.5 py-2 rounded-2xl bg-[#151515] hover:bg-[#1A1A1A] text-white text-xs font-bold border border-[#292929] hover:border-[#FF2638]/40 transition-colors flex items-center gap-1.5"
            title="Download full JSON export"
          >
            <Download className="w-3.5 h-3.5 text-[#FF2638]" />
            <span>Export Data</span>
          </a>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-2xl bg-[#151515] hover:bg-[#1A1A1A] text-white text-xs font-bold border border-[#292929] hover:border-[#FF2638]/40 transition-colors flex items-center gap-1.5"
            title="Print Wellness Report"
          >
            <Printer className="w-3.5 h-3.5 text-[#FF2638]" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* COMPOSITE LIFESYNC SCORE HERO CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#151515] border border-[#292929] hover:border-[#FF2638]/40 shadow-2xl transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#292929]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#FF2638]/40 text-[#FF2638] text-xs font-bold mb-2 shadow-[0_0_10px_rgba(255,38,56,0.2)]">
              <Award className="w-3.5 h-3.5 text-[#FF2638]" />
              <span>Holistic LifeSync Wellness Score</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-mono">
              {data?.compositeScore || 88} <span className="text-lg text-[#999999]">/ 100</span>
            </h2>
            <p className="text-xs text-[#999999] mt-1">
              Evaluated over the last {rangeDays} days across 5 core wellness dimensions
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF2638]">
              Wellness Tier
            </span>
            <p className="text-lg font-black text-white">
              {(data?.compositeScore || 88) >= 85 ? "Optimal Vitality Sync ⚡" : "Consistent Execution 🚀"}
            </p>
          </div>
        </div>

        {/* 5-Dimension Score Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-6">
          {data?.scoreBreakdown &&
            Object.entries(data.scoreBreakdown).map(([key, item]) => (
              <div key={key} className="p-3.5 rounded-2xl bg-[#101010] border border-[#292929]">
                <p className="text-[11px] font-semibold text-[#999999] truncate">{item.label}</p>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <span className="text-xl font-black text-white">{item.score}</span>
                  <span className="text-xs text-[#999999]">/ {item.max} pts</span>
                </div>
                <div className="w-full bg-[#151515] h-1.5 rounded-full overflow-hidden mt-2 border border-[#292929]">
                  <div
                    className="bg-[#FF2638] h-full rounded-full shadow-[0_0_6px_#FF2638]"
                    style={{ width: `${(item.score / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-[#151515] border border-[#292929]">
          <span className="text-xs text-[#999999]">Avg Sleep</span>
          <p className="text-xl font-bold text-white mt-1 font-mono">{data?.summary.avgSleepHours || 0} hrs</p>
          <p className="text-[10px] text-[#999999]">Target: {data?.summary.sleepTargetHours}h</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#151515] border border-[#292929]">
          <span className="text-xs text-[#999999]">Avg Steps</span>
          <p className="text-xl font-bold text-[#FF2638] mt-1 font-mono">
            {(data?.summary.avgSteps || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-[#999999]">Target: {data?.summary.stepGoal}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#151515] border border-[#292929]">
          <span className="text-xs text-[#999999]">Total Distance</span>
          <p className="text-xl font-bold text-white mt-1 font-mono">{data?.summary.totalDistance || 0} km</p>
          <p className="text-[10px] text-[#999999]">Across {rangeDays} days</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#151515] border border-[#292929]">
          <span className="text-xs text-[#999999]">Active Burn</span>
          <p className="text-xl font-bold text-[#FF2638] mt-1 font-mono">
            {(data?.summary.totalCaloriesBurned || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-[#999999]">Total burned</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#151515] border border-[#292929]">
          <span className="text-xs text-[#999999]">Avg Screen</span>
          <p className="text-xl font-bold text-white mt-1 font-mono">
            {data?.summary.avgScreenHours || 0} hrs
          </p>
          <p className="text-[10px] text-[#999999]">Per day</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#151515] border border-[#292929]">
          <span className="text-xs text-[#999999]">Habit Adherence</span>
          <p className="text-xl font-bold text-[#FF2638] mt-1 font-mono">{data?.summary.avgHabitRate || 0}%</p>
          <p className="text-[10px] text-[#999999]">Execution rate</p>
        </div>
      </div>

      {/* DETAILED CHARTS: Sleep, Steps, Nutrition, Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep Duration & Quality Trend */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Sleep Duration Trajectory</h3>
              <p className="text-xs text-[#999999]">Nightly hours slept</p>
            </div>
            <span className="text-xs font-bold text-[#FF2638]">Hours</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="dayLabel" stroke="#666666" fontSize={10} tickLine={false} />
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
                <ReferenceLine y={8.0} stroke="#FF2638" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="sleepHours" stroke="#FF2638" fill="#B5121B" fillOpacity={0.25} name="Sleep (hours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Steps History Chart */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Steps History</h3>
              <p className="text-xs text-[#999999]">Step volume across timeline</p>
            </div>
            <span className="text-xs font-bold text-[#FF2638]">Steps</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="dayLabel" stroke="#666666" fontSize={10} tickLine={false} />
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
                <ReferenceLine y={10000} stroke="#FF2638" strokeDasharray="3 3" />
                <Bar dataKey="steps" fill="#FF2638" radius={[4, 4, 0, 0]} name="Steps" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Caloric Intake Trajectory */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Caloric Intake vs Goal</h3>
              <p className="text-xs text-[#999999]">Daily calorie consumption</p>
            </div>
            <span className="text-xs font-bold text-[#FF2638]">kcal</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="dayLabel" stroke="#666666" fontSize={10} tickLine={false} />
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
                <ReferenceLine y={2200} stroke="#FF2638" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="caloriesConsumed" stroke="#FF2638" strokeWidth={2.5} dot={{ fill: "#FF2638", r: 3 }} name="Consumed (kcal)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habit Execution Trend */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Habit Completion Rate</h3>
              <p className="text-xs text-[#999999]">Discipline consistency %</p>
            </div>
            <span className="text-xs font-bold text-[#FF2638]">Rate %</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="dayLabel" stroke="#666666" fontSize={10} tickLine={false} />
                <YAxis stroke="#666666" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#101010",
                    borderColor: "#292929",
                    borderRadius: "12px",
                    color: "#FFF",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="habitRate" stroke="#FF2638" fill="#B5121B" fillOpacity={0.25} name="Habit Rate %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
