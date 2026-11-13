"use client";

import React, { useState } from "react";
import { X, Activity, Flame, Footprints, Clock, MapPin, Check } from "lucide-react";

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityLogged: () => void;
}

const PRESET_ACTIVITIES = [
  { type: "Brisk Walking", calPerMin: 4.8, stepPerMin: 110, hasDistance: true },
  { type: "Outdoor Running", calPerMin: 11.2, stepPerMin: 160, hasDistance: true },
  { type: "Cycling", calPerMin: 8.5, stepPerMin: 0, hasDistance: true },
  { type: "Strength Training", calPerMin: 6.0, stepPerMin: 25, hasDistance: false },
  { type: "HIIT Workout", calPerMin: 10.0, stepPerMin: 70, hasDistance: false },
  { type: "Vinyasa Yoga", calPerMin: 4.0, stepPerMin: 10, hasDistance: false },
  { type: "Swimming", calPerMin: 9.0, stepPerMin: 0, hasDistance: true },
];

export default function LogActivityModal({ isOpen, onClose, onActivityLogged }: LogActivityModalProps) {
  const [selectedType, setSelectedType] = useState(PRESET_ACTIVITIES[0].type);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [distanceKm, setDistanceKm] = useState(2.5);
  const [caloriesBurned, setCaloriesBurned] = useState(150);
  const [steps, setSteps] = useState(3300);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    const preset = PRESET_ACTIVITIES.find((p) => p.type === type);
    if (preset) {
      setCaloriesBurned(Math.round(preset.calPerMin * durationMinutes));
      setSteps(Math.round(preset.stepPerMin * durationMinutes));
    }
  };

  const handleDurationChange = (mins: number) => {
    setDurationMinutes(mins);
    const preset = PRESET_ACTIVITIES.find((p) => p.type === selectedType);
    if (preset) {
      setCaloriesBurned(Math.round(preset.calPerMin * mins));
      setSteps(Math.round(preset.stepPerMin * mins));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          durationMinutes,
          distanceKm: Number(distanceKm),
          caloriesBurned: Number(caloriesBurned),
          steps: Number(steps),
          notes,
        }),
      });

      if (res.ok) {
        onActivityLogged();
        onClose();
      }
    } catch (err) {
      console.error("Log activity error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#151515] border border-[#292929] rounded-3xl p-6 shadow-2xl text-[#F5F5F5] animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#292929] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638] border border-[#FF2638]/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Log Physical Activity</h2>
              <p className="text-xs text-[#999999]">Record your workout and steps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#101010] text-[#999999] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Activity Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#999999] uppercase tracking-wider mb-2">
              Select Workout Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_ACTIVITIES.map((act) => (
                <button
                  key={act.type}
                  type="button"
                  onClick={() => handleTypeChange(act.type)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-left truncate transition-all ${
                    selectedType === act.type
                      ? "bg-[#B5121B]/25 border-[#FF2638] text-[#FF2638] font-bold shadow-[0_0_10px_rgba(255,38,56,0.3)]"
                      : "bg-[#101010] border-[#292929] text-[#999999] hover:border-[#FF2638]/40 hover:text-[#F5F5F5]"
                  }`}
                >
                  {act.type}
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Distance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#999999] mb-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FF2638]" />
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="600"
                value={durationMinutes}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF2638]"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#999999] mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF2638]" />
                Distance (km)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF2638]"
              />
            </div>
          </div>

          {/* Calories Burned & Steps Contributed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#999999] mb-1.5">
                <Flame className="w-3.5 h-3.5 text-[#FF2638]" />
                Calories (kcal)
              </label>
              <input
                type="number"
                min="0"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF2638]"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#999999] mb-1.5">
                <Footprints className="w-3.5 h-3.5 text-[#FF2638]" />
                Steps Contributed
              </label>
              <input
                type="number"
                min="0"
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF2638]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-1.5">
              Workout Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. High intensity intervals, felt great"
              className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF2638]"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#999999] hover:text-white hover:bg-[#101010] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white text-sm font-bold shadow-[0_0_15px_rgba(255,38,56,0.35)] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Log Activity"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
