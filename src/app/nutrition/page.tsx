"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Utensils,
  Plus,
  Flame,
  Droplets,
  Sparkles,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Pencil,
  X,
  Save,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import LogFoodModal from "@/components/modals/LogFoodModal";

interface FoodEntry {
  id: string;
  date: string;
  mealType: string;
  foodName: string;
  servingSize: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  notes: string;
}

interface NutritionData {
  date: string;
  entries: FoodEntry[];
  meals: {
    breakfast: FoodEntry[];
    lunch: FoodEntry[];
    dinner: FoodEntry[];
    snack: FoodEntry[];
  };
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  insights: string[];
}

export default function NutritionPage() {
  const [data, setData] = useState<NutritionData | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  // Water data
  const [waterTotal, setWaterTotal] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2500);

  // Modals
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [activeMealForModal, setActiveMealForModal] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");

  // Calorie Goal Edit Modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newCalorieGoal, setNewCalorieGoal] = useState(2000);
  const [newProteinGoal, setNewProteinGoal] = useState(120);
  const [newCarbsGoal, setNewCarbsGoal] = useState(220);
  const [newFatGoal, setNewFatGoal] = useState(60);
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalFeedback, setGoalFeedback] = useState("");

  // Edit Existing Food Entry Modal
  const [showEditFoodModal, setShowEditFoodModal] = useState(false);
  const [editFoodId, setEditFoodId] = useState("");
  const [editFoodName, setEditFoodName] = useState("");
  const [editCalories, setEditCalories] = useState<number | string>(0);
  const [editServing, setEditServing] = useState("1 serving");
  const [editMealType, setEditMealType] = useState("snack");
  const [editProtein, setEditProtein] = useState<number | string>(0);
  const [editCarbs, setEditCarbs] = useState<number | string>(0);
  const [editFat, setEditFat] = useState<number | string>(0);
  const [editFiber, setEditFiber] = useState<number | string>(0);
  const [savingEditFood, setSavingEditFood] = useState(false);

  // Quick Calorie Log Modal
  const [showQuickCalModal, setShowQuickCalModal] = useState(false);
  const [quickCalories, setQuickCalories] = useState<number | string>(300);
  const [quickLabel, setQuickLabel] = useState("Quick Calorie Entry");
  const [quickMeal, setQuickMeal] = useState<"breakfast" | "lunch" | "dinner" | "snack">("snack");
  const [savingQuickCal, setSavingQuickCal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [nutRes, waterRes] = await Promise.all([
        fetch(`/api/nutrition?date=${selectedDate}`),
        fetch(`/api/water?date=${selectedDate}`),
      ]);

      if (nutRes.ok) {
        const nJson = await nutRes.json();
        setData(nJson);
        setNewCalorieGoal(nJson.goals?.calories || 2000);
        setNewProteinGoal(nJson.goals?.protein || 120);
        setNewCarbsGoal(nJson.goals?.carbs || 220);
        setNewFatGoal(nJson.goals?.fat || 60);
      }

      if (waterRes.ok) {
        const wJson = await waterRes.json();
        setWaterTotal(wJson.totalMl || 0);
        setWaterGoal(wJson.goalMl || 2500);
      }
    } catch (err) {
      console.error("Nutrition fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAddFood = (meal: "breakfast" | "lunch" | "dinner" | "snack") => {
    setActiveMealForModal(meal);
    setShowFoodModal(true);
  };

  const handleDeleteFood = async (id: string) => {
    try {
      const res = await fetch(`/api/nutrition?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error("Delete food error:", e);
    }
  };

  const handleOpenEditFood = (item: FoodEntry) => {
    setEditFoodId(item.id);
    setEditFoodName(item.foodName);
    setEditCalories(item.calories);
    setEditServing(item.servingSize || "1 serving");
    setEditMealType(item.mealType);
    setEditProtein(item.proteinG || 0);
    setEditCarbs(item.carbsG || 0);
    setEditFat(item.fatG || 0);
    setEditFiber(item.fiberG || 0);
    setShowEditFoodModal(true);
  };

  const handleSaveEditFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFoodName || Number(editCalories) < 0) return;

    setSavingEditFood(true);
    try {
      const res = await fetch("/api/nutrition", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editFoodId,
          foodName: editFoodName,
          calories: Number(editCalories),
          servingSize: editServing,
          mealType: editMealType,
          proteinG: Number(editProtein) || 0,
          carbsG: Number(editCarbs) || 0,
          fatG: Number(editFat) || 0,
          fiberG: Number(editFiber) || 0,
        }),
      });

      if (res.ok) {
        setShowEditFoodModal(false);
        await fetchData();
      }
    } catch (err) {
      console.error("Error updating food entry:", err);
    } finally {
      setSavingEditFood(false);
    }
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoal(true);
    try {
      const res = await fetch("/api/nutrition", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateGoal",
          calorieGoal: Number(newCalorieGoal),
          proteinGoalG: Number(newProteinGoal),
          carbsGoalG: Number(newCarbsGoal),
          fatGoalG: Number(newFatGoal),
        }),
      });

      if (res.ok) {
        setGoalFeedback("Daily Calorie target updated!");
        await fetchData();
        setTimeout(() => {
          setGoalFeedback("");
          setShowGoalModal(false);
        }, 1000);
      }
    } catch (err) {
      console.error("Error updating calorie goal:", err);
    } finally {
      setSavingGoal(false);
    }
  };

  const handleSaveQuickCal = async (e: React.FormEvent) => {
    e.preventDefault();
    const cals = Number(quickCalories);
    if (!cals || cals <= 0) return;

    setSavingQuickCal(true);
    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          mealType: quickMeal,
          foodName: quickLabel || "Quick Calorie Log",
          calories: cals,
          servingSize: "1 portion",
        }),
      });

      if (res.ok) {
        setShowQuickCalModal(false);
        await fetchData();
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#FF2638", "#B5121B", "#FFFFFF"],
        });
      }
    } catch (err) {
      console.error("Error saving quick calorie entry:", err);
    } finally {
      setSavingQuickCal(false);
    }
  };

  const handleAddWater = async (amount: number) => {
    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, amountMl: amount }),
      });
      if (res.ok) {
        await fetchData();
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.8 },
          colors: ["#FF2638", "#B5121B", "#FFFFFF"],
        });
      }
    } catch (e) {
      console.error("Water error:", e);
    }
  };

  const handleUndoWater = async () => {
    try {
      const res = await fetch(`/api/water?date=${selectedDate}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error("Undo water error:", e);
    }
  };

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const remainingCalories = Math.max(0, (data?.goals.calories || 2000) - (data?.totals.calories || 0));

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Log Food Standard Modal */}
      <LogFoodModal
        isOpen={showFoodModal}
        onClose={() => setShowFoodModal(false)}
        onFoodLogged={fetchData}
        defaultMeal={activeMealForModal}
      />

      {/* EDIT CALORIE & MACRO TARGET MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#151515] border border-[#292929] rounded-3xl p-6 shadow-2xl text-[#F5F5F5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#292929] mb-4">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#FF2638]" />
                <h3 className="text-base font-bold text-white">Edit Calorie Intake Target</h3>
              </div>
              <button
                onClick={() => setShowGoalModal(false)}
                className="p-1 rounded-xl hover:bg-[#101010] text-[#999999]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#FF2638] uppercase tracking-wider mb-1.5">
                  Daily Caloric Target (kcal)
                </label>
                <input
                  type="number"
                  step="50"
                  min="500"
                  max="8000"
                  value={newCalorieGoal}
                  onChange={(e) => setNewCalorieGoal(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white font-mono focus:outline-none focus:border-[#FF2638]"
                />
                <p className="text-[11px] text-[#999999] mt-1">Adjust your daily calorie consumption ceiling</p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#292929]">
                <div>
                  <label className="block text-[11px] font-semibold text-white mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={newProteinGoal}
                    onChange={(e) => setNewProteinGoal(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#101010] border border-[#292929] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={newCarbsGoal}
                    onChange={(e) => setNewCarbsGoal(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#101010] border border-[#292929] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={newFatGoal}
                    onChange={(e) => setNewFatGoal(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#101010] border border-[#292929] text-xs text-white"
                  />
                </div>
              </div>

              {goalFeedback && (
                <div className="p-2.5 rounded-xl bg-[#1A0507] border border-[#FF2638]/50 text-[#FF2638] text-xs flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  <span>{goalFeedback}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#101010] text-[#999999] text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGoal}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white font-bold text-xs shadow-[0_0_12px_rgba(255,38,56,0.4)] flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingGoal ? "Saving..." : "Save Calorie Target"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LOGGED FOOD ENTRY MODAL */}
      {showEditFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#151515] border border-[#292929] rounded-3xl p-6 shadow-2xl text-[#F5F5F5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#292929] mb-4">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#FF2638]" />
                <h3 className="text-base font-bold text-white">Edit Food / Calorie Intake</h3>
              </div>
              <button
                onClick={() => setShowEditFoodModal(false)}
                className="p-1 rounded-xl hover:bg-[#101010] text-[#999999]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditFood} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">Food Item Name</label>
                <input
                  type="text"
                  value={editFoodName}
                  onChange={(e) => setEditFoodName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#FF2638] mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    value={editCalories}
                    onChange={(e) => setEditCalories(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white font-mono focus:outline-none focus:border-[#FF2638]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Serving Size</label>
                  <input
                    type="text"
                    value={editServing}
                    onChange={(e) => setEditServing(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Meal Category</label>
                <select
                  value={editMealType}
                  onChange={(e) => setEditMealType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white capitalize focus:outline-none"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#292929]">
                <div>
                  <label className="block text-[10px] text-[#999999] mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={editProtein}
                    onChange={(e) => setEditProtein(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#101010] border border-[#292929] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#999999] mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={editCarbs}
                    onChange={(e) => setEditCarbs(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#101010] border border-[#292929] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#999999] mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={editFat}
                    onChange={(e) => setEditFat(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#101010] border border-[#292929] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#999999] mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    value={editFiber}
                    onChange={(e) => setEditFiber(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#101010] border border-[#292929] text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditFoodModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#101010] text-[#999999] text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEditFood}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white font-bold text-xs shadow-[0_0_12px_rgba(255,38,56,0.4)] flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingEditFood ? "Saving..." : "Update Intake"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK CALORIE INTAKE MODAL */}
      {showQuickCalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#151515] border border-[#292929] rounded-3xl p-6 shadow-2xl text-[#F5F5F5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#292929] mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FF2638]" />
                <h3 className="text-base font-bold text-white">Quick Calorie Intake</h3>
              </div>
              <button
                onClick={() => setShowQuickCalModal(false)}
                className="p-1 rounded-xl hover:bg-[#101010] text-[#999999]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickCal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#FF2638] mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  min="1"
                  max="4000"
                  value={quickCalories}
                  onChange={(e) => setQuickCalories(e.target.value)}
                  required
                  placeholder="e.g. 350"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white font-mono focus:outline-none focus:border-[#FF2638]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Meal</label>
                <select
                  value={quickMeal}
                  onChange={(e) => setQuickMeal(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white capitalize focus:outline-none"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Description / Note</label>
                <input
                  type="text"
                  value={quickLabel}
                  onChange={(e) => setQuickLabel(e.target.value)}
                  placeholder="e.g. Protein shake or afternoon snack"
                  className="w-full px-3 py-2 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowQuickCalModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#101010] text-[#999999] text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingQuickCal}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white font-bold text-xs shadow-[0_0_12px_rgba(255,38,56,0.4)] flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{savingQuickCal ? "Saving..." : "Add Calories"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header & Date Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF2638] uppercase tracking-widest">
            <Utensils className="w-3.5 h-3.5" />
            <span>Nutritional Diary & Macros</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Nutrition Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[#999999] mt-1">
            Log meals, edit caloric intake targets, and monitor daily hydration
          </p>
        </div>

        {/* Date Selector & Quick Calorie Button */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowQuickCalModal(true)}
            className="px-3 py-2 rounded-2xl bg-[#101010] hover:bg-[#1A0507] text-[#FF2638] hover:border-[#FF2638] border border-[#292929] text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Quick Calorie</span>
          </button>

          <div className="flex items-center gap-2 bg-[#151515] border border-[#292929] p-1.5 rounded-2xl">
            <button
              onClick={() => shiftDate(-1)}
              className="p-1.5 rounded-xl hover:bg-[#101010] text-[#999999] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-white font-mono">
              {selectedDate === new Date().toISOString().split("T")[0]
                ? "Today"
                : new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <button
              onClick={() => shiftDate(1)}
              className="p-1.5 rounded-xl hover:bg-[#101010] text-[#999999] hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MACRO OVERVIEW & CALORIE HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Caloric Budget Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#151515] border border-[#292929] hover:border-[#FF2638]/40 shadow-xl flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF2638]">
                Caloric Budget
              </span>
              <button
                onClick={() => setShowGoalModal(true)}
                className="px-2.5 py-1 rounded-xl bg-[#101010] hover:bg-[#1A0507] text-[#FF2638] hover:text-white text-[11px] font-bold border border-[#292929] hover:border-[#FF2638]/50 flex items-center gap-1.5 transition-all"
                title="Edit Daily Calorie Target"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit Target</span>
              </button>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                {(data?.totals.calories || 0).toLocaleString()}
              </span>
              <span className="text-[#999999] text-sm">
                / {(data?.goals.calories || 2000).toLocaleString()} kcal
              </span>
            </div>
            <p className="text-xs text-[#999999] mt-2">
              <span className="text-[#FF2638] font-bold">{remainingCalories.toLocaleString()} kcal</span>{" "}
              remaining for today
            </p>

            <div className="w-full bg-[#101010] h-3 rounded-full overflow-hidden mt-4 p-0.5 border border-[#292929]">
              <div
                className="bg-gradient-to-r from-[#B5121B] via-[#FF2638] to-[#B5121B] h-full rounded-full transition-all duration-700 shadow-[0_0_10px_#FF2638]"
                style={{
                  width: `${Math.min(100, Math.round(((data?.totals.calories || 0) / (data?.goals.calories || 2000)) * 100))}%`,
                }}
              />
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-[#292929] flex items-center justify-between text-xs text-[#999999]">
            <span>Status:</span>
            <span className="text-[#FF2638] font-bold">
              {(data?.totals.calories || 0) <= (data?.goals.calories || 2000) ? "Within Target" : "Over Budget"}
            </span>
          </div>
        </div>

        {/* Macronutrient Breakdown Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Protein */}
          <div className="p-4 rounded-3xl bg-[#151515] border border-[#292929] hover:border-[#FF2638]/40 flex flex-col justify-between transition-all">
            <div>
              <span className="text-xs font-bold text-[#FF2638] uppercase tracking-wider">Protein</span>
              <p className="text-2xl font-black text-white font-mono mt-1">
                {data?.totals.protein || 0}g
              </p>
              <p className="text-[11px] text-[#999999]">Target: {data?.goals.protein || 120}g</p>
            </div>
            <div className="w-full bg-[#101010] h-2 rounded-full overflow-hidden mt-3 border border-[#292929]">
              <div
                className="bg-[#FF2638] h-full rounded-full shadow-[0_0_8px_#FF2638]"
                style={{
                  width: `${Math.min(100, Math.round(((data?.totals.protein || 0) / (data?.goals.protein || 120)) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="p-4 rounded-3xl bg-[#151515] border border-[#292929] hover:border-[#FF2638]/40 flex flex-col justify-between transition-all">
            <div>
              <span className="text-xs font-bold text-[#B5121B] uppercase tracking-wider">Carbs</span>
              <p className="text-2xl font-black text-white font-mono mt-1">
                {data?.totals.carbs || 0}g
              </p>
              <p className="text-[11px] text-[#999999]">Target: {data?.goals.carbs || 220}g</p>
            </div>
            <div className="w-full bg-[#101010] h-2 rounded-full overflow-hidden mt-3 border border-[#292929]">
              <div
                className="bg-[#B5121B] h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.round(((data?.totals.carbs || 0) / (data?.goals.carbs || 220)) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="p-4 rounded-3xl bg-[#151515] border border-[#292929] hover:border-[#FF2638]/40 flex flex-col justify-between transition-all">
            <div>
              <span className="text-xs font-bold text-[#7A0C12] uppercase tracking-wider">Fat</span>
              <p className="text-2xl font-black text-white font-mono mt-1">
                {data?.totals.fat || 0}g
              </p>
              <p className="text-[11px] text-[#999999]">Target: {data?.goals.fat || 60}g</p>
            </div>
            <div className="w-full bg-[#101010] h-2 rounded-full overflow-hidden mt-3 border border-[#292929]">
              <div
                className="bg-[#7A0C12] h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.round(((data?.totals.fat || 0) / (data?.goals.fat || 60)) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Fiber */}
          <div className="p-4 rounded-3xl bg-[#151515] border border-[#292929] hover:border-[#FF2638]/40 flex flex-col justify-between transition-all">
            <div>
              <span className="text-xs font-bold text-[#FF6675] uppercase tracking-wider">Fiber</span>
              <p className="text-2xl font-black text-white font-mono mt-1">
                {data?.totals.fiber || 0}g
              </p>
              <p className="text-[11px] text-[#999999]">Target: 30g</p>
            </div>
            <div className="w-full bg-[#101010] h-2 rounded-full overflow-hidden mt-3 border border-[#292929]">
              <div
                className="bg-[#FF6675] h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.round(((data?.totals.fiber || 0) / 30) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* HYDRATION TRACKER */}
      <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-5 h-5 text-[#FF2638]" />
            <h3 className="text-base font-bold text-white">Daily Water Intake</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {waterTotal.toLocaleString()}
            </span>
            <span className="text-[#999999] text-sm">/ {waterGoal.toLocaleString()} ml</span>
            <span className="text-xs font-bold text-[#FF2638] ml-2">
              ({Math.min(100, Math.round((waterTotal / waterGoal) * 100))}%)
            </span>
          </div>

          <div className="w-full max-w-md bg-[#101010] h-2.5 rounded-full overflow-hidden mt-3 border border-[#292929]">
            <div
              className="bg-gradient-to-r from-[#B5121B] via-[#FF2638] to-[#B5121B] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#FF2638]"
              style={{ width: `${Math.min(100, Math.round((waterTotal / waterGoal) * 100))}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleAddWater(250)}
            className="px-3.5 py-2.5 rounded-xl bg-[#101010] hover:bg-[#1A0507] text-[#FF2638] border border-[#292929] hover:border-[#FF2638]/50 text-xs font-bold transition-all"
          >
            +250ml (Glass)
          </button>
          <button
            onClick={() => handleAddWater(500)}
            className="px-3.5 py-2.5 rounded-xl bg-[#101010] hover:bg-[#1A0507] text-[#FF2638] border border-[#292929] hover:border-[#FF2638]/50 text-xs font-bold transition-all"
          >
            +500ml (Bottle)
          </button>
          <button
            onClick={handleUndoWater}
            className="px-3 py-2.5 rounded-xl bg-[#101010] hover:bg-[#1A1A1A] text-[#999999] hover:text-white border border-[#292929] text-xs transition-colors"
          >
            Undo
          </button>
        </div>
      </div>

      {/* MEALS LIST: Breakfast, Lunch, Dinner, Snacks */}
      <div className="space-y-4">
        {(["breakfast", "lunch", "dinner", "snack"] as const).map((mealKey) => {
          const items = data?.meals[mealKey] || [];
          const mealCals = items.reduce((acc, i) => acc + i.calories, 0);

          return (
            <div key={mealKey} className="p-5 rounded-3xl bg-[#151515] border border-[#292929]">
              <div className="flex items-center justify-between pb-3 border-b border-[#292929] mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-bold text-white capitalize">{mealKey}</h4>
                  <span className="text-xs text-[#FF2638] font-bold">{mealCals} kcal</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setQuickMeal(mealKey);
                      setShowQuickCalModal(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[#101010] hover:bg-[#1A0507] text-[#999999] hover:text-[#FF2638] text-xs font-semibold border border-[#292929] hover:border-[#FF2638]/40 transition-colors flex items-center gap-1"
                    title="Quick log calories directly"
                  >
                    <Flame className="w-3 h-3 text-[#FF2638]" />
                    <span>Quick Cal</span>
                  </button>
                  <button
                    onClick={() => handleOpenAddFood(mealKey)}
                    className="px-3 py-1.5 rounded-xl bg-[#101010] hover:bg-[#1A0507] text-white text-xs font-bold border border-[#292929] hover:border-[#FF2638]/50 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#FF2638]" />
                    <span>Add Food</span>
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <p className="text-xs text-[#999999] py-2 italic">No food logged for {mealKey} yet.</p>
              ) : (
                <div className="divide-y divide-[#292929]">
                  {items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">{item.foodName}</p>
                        <p className="text-[11px] text-[#999999]">
                          {item.servingSize} &bull;{" "}
                          <span className="text-[#FF2638] font-bold">{item.calories} kcal</span> &bull; P:{" "}
                          {item.proteinG}g &bull; C: {item.carbsG}g &bull; F: {item.fatG}g
                          {item.fiberG > 0 && ` • Fiber: ${item.fiberG}g`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditFood(item)}
                          className="p-1.5 rounded-lg hover:bg-[#FF2638]/20 text-[#666666] hover:text-[#FF2638] transition-colors"
                          title="Edit food & calories"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFood(item.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-[#666666] hover:text-[#FF2638] transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BALANCED EATING INSIGHTS */}
      {data?.insights && data.insights.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#FF2638]" />
            <h3 className="text-sm font-bold text-white">Balanced Nutrition Insights</h3>
          </div>
          <div className="space-y-2">
            {data.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[#999999]">
                <CheckCircle className="w-3.5 h-3.5 text-[#FF2638] mt-0.5 shrink-0" />
                <span className="text-[#F5F5F5]">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
