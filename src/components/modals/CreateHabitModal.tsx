"use client";

import React, { useState } from "react";
import { X, Check, Sparkles, Heart, Footprints, Droplets, BookOpen, Brain, Moon, Sun } from "lucide-react";

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitCreated: () => void;
}

const CATEGORIES = [
  { id: "wellness", label: "Wellness", icon: Sparkles, color: "#FF2638" },
  { id: "fitness", label: "Fitness", icon: Footprints, color: "#B5121B" },
  { id: "productivity", label: "Productivity", icon: Brain, color: "#E53E3E" },
  { id: "mindfulness", label: "Mindfulness", icon: Moon, color: "#9B1C1C" },
];

const PRESET_IDEAS = [
  { title: "Drink 500ml water upon waking", category: "wellness", color: "#FF2638" },
  { title: "No screens 45m before sleep", category: "mindfulness", color: "#B5121B" },
  { title: "10,000 daily steps", category: "fitness", color: "#FF2638" },
  { title: "Read 15 pages of a book", category: "productivity", color: "#E53E3E" },
  { title: "Morning stretch & posture check", category: "fitness", color: "#B5121B" },
  { title: "5-minute mindfulness breathing", category: "mindfulness", color: "#FF2638" },
];

export default function CreateHabitModal({ isOpen, onClose, onHabitCreated }: CreateHabitModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("wellness");
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(7);
  const [color, setColor] = useState("#FF2638");
  const [reminderTime, setReminderTime] = useState("08:00");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePickPreset = (preset: typeof PRESET_IDEAS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setColor(preset.color);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description,
          category,
          targetDaysPerWeek,
          color,
          reminderTime,
        }),
      });

      if (res.ok) {
        onHabitCreated();
        onClose();
      }
    } catch (err) {
      console.error("Create habit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#151515] border border-[#292929] rounded-3xl p-6 shadow-2xl text-[#F5F5F5] animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#292929] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638] border border-[#FF2638]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create Daily Habit</h2>
              <p className="text-xs text-[#999999]">Build automated routines & streaks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#101010] text-[#999999] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Ideas */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#999999] uppercase tracking-wider mb-2">
            Inspiration Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_IDEAS.map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePickPreset(idea)}
                className="py-1 px-2.5 rounded-lg text-xs bg-[#101010] hover:bg-[#1A0507] text-[#999999] hover:text-white border border-[#292929] hover:border-[#FF2638]/40 transition-colors"
              >
                + {idea.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-1">Habit Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 20 pages"
              className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF2638]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#999999] mb-1">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    setColor(cat.color);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                    category === cat.id
                      ? "bg-[#B5121B]/25 border-[#FF2638] text-[#FF2638] font-bold shadow-[0_0_10px_rgba(255,38,56,0.25)]"
                      : "bg-[#101010] border-[#292929] text-[#999999] hover:text-white"
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">
                Target Days / Week
              </label>
              <select
                value={targetDaysPerWeek}
                onChange={(e) => setTargetDaysPerWeek(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF2638]"
              >
                <option value={7}>Every Day (7 days)</option>
                <option value={6}>6 days a week</option>
                <option value={5}>Weekdays (5 days)</option>
                <option value={4}>4 days a week</option>
                <option value={3}>3 days a week</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">
                Daily Reminder
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF2638]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#999999] hover:text-white hover:bg-[#101010]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,38,56,0.35)] disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{loading ? "Creating..." : "Save Habit"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
