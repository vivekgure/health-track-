"use client";

import React, { useState } from "react";
import { X, Utensils, Search, Plus, Check } from "lucide-react";

interface LogFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodLogged: () => void;
  defaultMeal?: "breakfast" | "lunch" | "dinner" | "snack";
}

const COMMON_FOODS = [
  { name: "Scrambled Eggs (2 eggs)", meal: "breakfast", cals: 180, p: 12, c: 2, f: 14, fib: 0, serving: "2 large eggs" },
  { name: "Rolled Oats with Berries", meal: "breakfast", cals: 280, p: 8, c: 52, f: 5, fib: 7, serving: "1 bowl (60g dry)" },
  { name: "Greek Yogurt 0% Fat", meal: "breakfast", cals: 130, p: 20, c: 8, f: 0, fib: 0, serving: "1 cup (170g)" },
  { name: "Avocado Sourdough Toast", meal: "breakfast", cals: 320, p: 9, c: 36, f: 16, fib: 6, serving: "1 slice sourdough + half avocado" },
  { name: "Grilled Chicken Breast Bowl", meal: "lunch", cals: 450, p: 48, c: 35, f: 12, fib: 5, serving: "200g chicken + 1 cup rice" },
  { name: "Quinoa Veggie Salad", meal: "lunch", cals: 360, p: 11, c: 48, f: 14, fib: 8, serving: "1 large bowl" },
  { name: "Tuna Wrap with Greens", meal: "lunch", cals: 390, p: 32, c: 40, f: 10, fib: 4, serving: "1 whole wheat wrap" },
  { name: "Pan-Seared Salmon Fillet", meal: "dinner", cals: 520, p: 42, c: 25, f: 28, fib: 4, serving: "200g salmon + asparagus" },
  { name: "Lean Steak with Sweet Potato", meal: "dinner", cals: 580, p: 45, c: 50, f: 18, fib: 6, serving: "180g sirloin + baked sweet potato" },
  { name: "Tofu Vegetable Stir-Fry", meal: "dinner", cals: 380, p: 22, c: 38, f: 16, fib: 7, serving: "1 plate with jasmine rice" },
  { name: "Whey Protein Shake", meal: "snack", cals: 160, p: 28, c: 5, f: 2, fib: 1, serving: "1 scoop in water/milk" },
  { name: "Raw Almonds & Apple", meal: "snack", cals: 220, p: 6, c: 25, f: 12, fib: 5, serving: "28g nuts + 1 medium apple" },
  { name: "Protein Bar", meal: "snack", cals: 210, p: 20, c: 22, f: 7, fib: 10, serving: "1 bar (60g)" },
];

export default function LogFoodModal({
  isOpen,
  onClose,
  onFoodLogged,
  defaultMeal = "lunch",
}: LogFoodModalProps) {
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">(defaultMeal);
  const [activeTab, setActiveTab] = useState<"library" | "custom">("library");
  const [searchQuery, setSearchQuery] = useState("");

  // Custom food fields
  const [foodName, setFoodName] = useState("");
  const [servingSize, setServingSize] = useState("1 serving");
  const [calories, setCalories] = useState<number>(350);
  const [proteinG, setProteinG] = useState<number>(25);
  const [carbsG, setCarbsG] = useState<number>(35);
  const [fatG, setFatG] = useState<number>(12);
  const [fiberG, setFiberG] = useState<number>(4);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const filteredFoods = COMMON_FOODS.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectQuickFood = async (item: typeof COMMON_FOODS[0]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType,
          foodName: item.name,
          servingSize: item.serving,
          calories: item.cals,
          proteinG: item.p,
          carbsG: item.c,
          fatG: item.f,
          fiberG: item.fib,
        }),
      });

      if (res.ok) {
        onFoodLogged();
        onClose();
      }
    } catch (err) {
      console.error("Log quick food error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType,
          foodName: foodName.trim(),
          servingSize,
          calories: Number(calories),
          proteinG: Number(proteinG),
          carbsG: Number(carbsG),
          fatG: Number(fatG),
          fiberG: Number(fiberG),
        }),
      });

      if (res.ok) {
        onFoodLogged();
        onClose();
      }
    } catch (err) {
      console.error("Log custom food error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#151515] border border-[#292929] rounded-3xl p-6 shadow-2xl text-[#F5F5F5] animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#292929] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638] border border-[#FF2638]/30">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Log Food & Macros</h2>
              <p className="text-xs text-[#999999]">Track calories and macronutrients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#101010] text-[#999999] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Type Pills */}
        <div className="flex items-center gap-2 mb-4 p-1 bg-[#101010] rounded-2xl border border-[#292929]">
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMealType(m)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                mealType === m
                  ? "bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white shadow-[0_0_10px_rgba(255,38,56,0.3)] font-bold"
                  : "text-[#999999] hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Mode Toggle: Quick Library vs Custom Item */}
        <div className="flex border-b border-[#292929] mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === "library"
                ? "border-[#FF2638] text-[#FF2638]"
                : "border-transparent text-[#999999] hover:text-white"
            }`}
          >
            Foods Library
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === "custom"
                ? "border-[#FF2638] text-[#FF2638]"
                : "border-transparent text-[#999999] hover:text-white"
            }`}
          >
            Custom Entry
          </button>
        </div>

        {activeTab === "library" ? (
          <div>
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                type="text"
                placeholder="Search healthy foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-sm text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:border-[#FF2638]"
              />
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {filteredFoods.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#101010] hover:bg-[#1A0507] border border-[#292929] hover:border-[#FF2638]/40 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                    <p className="text-xs text-[#999999]">{item.serving}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[#999999] mt-1">
                      <span className="text-[#FF2638] font-bold">{item.cals} kcal</span>
                      <span>•</span>
                      <span>P: {item.p}g</span>
                      <span>•</span>
                      <span>C: {item.c}g</span>
                      <span>•</span>
                      <span>F: {item.f}g</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickFood(item)}
                    disabled={loading}
                    className="p-2 rounded-xl bg-[#B5121B]/20 hover:bg-[#FF2638]/30 text-[#FF2638] transition-colors flex-shrink-0 border border-[#FF2638]/30"
                    title="Add to meal"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Custom Food Entry Form */
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">Food Name</label>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Grilled Chicken Wrap"
                className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF2638]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">Serving Size</label>
              <input
                type="text"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                placeholder="e.g. 1 bowl (300g)"
                className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF2638]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-[#FF2638] mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white focus:outline-none focus:border-[#FF2638]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-400 mb-1">Protein (g)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={proteinG}
                  onChange={(e) => setProteinG(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white focus:outline-none focus:border-[#FF2638]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-cyan-400 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={carbsG}
                  onChange={(e) => setCarbsG(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white focus:outline-none focus:border-[#FF2638]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-purple-400 mb-1">Fat (g)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={fatG}
                  onChange={(e) => setFatG(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white focus:outline-none focus:border-[#FF2638]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1">Fiber (g)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={fiberG}
                  onChange={(e) => setFiberG(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white focus:outline-none focus:border-[#FF2638]"
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
                <span>{loading ? "Adding..." : "Add to Food Diary"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
