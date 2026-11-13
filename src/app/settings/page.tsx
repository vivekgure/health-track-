"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Settings,
  User as UserIcon,
  Target,
  Sun,
  Moon,
  Bell,
  Download,
  Check,
  Save,
  RotateCcw,
  Link as LinkIcon,
  Unlink,
  CheckCircle2,
} from "lucide-react";
import GoogleIcon from "@/components/common/GoogleIcon";
import GoogleAuthModal from "@/components/common/GoogleAuthModal";

export default function SettingsPage() {
  const { user, updateProfile, logout, unlinkGoogleAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile fields
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState("not_specified");
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [activityLevel, setActivityLevel] = useState("moderate");

  // Goals
  const [sleepTargetHours, setSleepTargetHours] = useState<number>(8.0);
  const [stepGoal, setStepGoal] = useState<number>(10000);
  const [waterGoalMl, setWaterGoalMl] = useState<number>(2500);
  const [calorieGoal, setCalorieGoal] = useState<number>(2200);
  const [proteinGoalG, setProteinGoalG] = useState<number>(120);
  const [carbsGoalG, setCarbsGoalG] = useState<number>(250);
  const [fatGoalG, setFatGoalG] = useState<number>(65);
  const [screenTimeLimitMinutes, setScreenTimeLimitMinutes] = useState<number>(240);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [unlinkingGoogle, setUnlinkingGoogle] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("googleLinked") === "true") {
        setMessage("Google account successfully linked to your LifeSync profile!");
      }
    }
  }, []);

  const handleResetToZero = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage("All data has been reset to zero! Redirecting to fresh dashboard...");
        setConfirmReset(false);
        setTimeout(() => {
          window.location.href = "/";
        }, 1200);
      } else {
        setMessage(data.error || "Failed to reset data");
      }
    } catch {
      setMessage("Network error resetting data");
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      if (user.profile) {
        setAge(user.profile.age || 28);
        setGender(user.profile.gender || "not_specified");
        setHeightCm(user.profile.heightCm || 175);
        setWeightKg(user.profile.weightKg || 70);
        setActivityLevel(user.profile.activityLevel || "moderate");
        setSleepTargetHours(user.profile.sleepTargetHours || 8.0);
        setStepGoal(user.profile.stepGoal || 10000);
        setWaterGoalMl(user.profile.waterGoalMl || 2500);
        setCalorieGoal(user.profile.calorieGoal || 2200);
        setProteinGoalG(user.profile.proteinGoalG || 120);
        setCarbsGoalG(user.profile.carbsGoalG || 250);
        setFatGoalG(user.profile.fatGoalG || 65);
        setScreenTimeLimitMinutes(user.profile.screenTimeLimitMinutes || 240);
      }
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await updateProfile({
      name,
      age: Number(age),
      gender,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      activityLevel,
      sleepTargetHours: Number(sleepTargetHours),
      stepGoal: Number(stepGoal),
      waterGoalMl: Number(waterGoalMl),
      calorieGoal: Number(calorieGoal),
      proteinGoalG: Number(proteinGoalG),
      carbsGoalG: Number(carbsGoalG),
      fatGoalG: Number(fatGoalG),
      screenTimeLimitMinutes: Number(screenTimeLimitMinutes),
    });

    setSaving(false);
    if (res.success) {
      setMessage("Settings and biometric targets updated successfully!");
      setTimeout(() => setMessage(""), 4000);
    } else {
      setMessage(res.error || "Failed to update settings");
    }
  };

  const handleUnlinkGoogle = async () => {
    setUnlinkingGoogle(true);
    const res = await unlinkGoogleAccount();
    setUnlinkingGoogle(false);
    if (res.success) {
      setMessage("Google account successfully unlinked from your profile.");
      setTimeout(() => setMessage(""), 4000);
    } else {
      setMessage(res.error || "Failed to unlink Google account");
    }
  };

  const handleRequestNotifications = async () => {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        new Notification("LifeSync Notifications Active", {
          body: "Bedtime protocol and hydration prompts enabled.",
          icon: "/icon-192.svg",
        });
        setMessage("Browser notifications enabled!");
      } else {
        setMessage("Notification permission denied or blocked in browser settings.");
      }
    }
  };

  const isGoogleLinked = !!(user?.googleId || user?.googleEmail);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl animate-fadeIn">
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        mode="link"
        currentEmail={user?.googleEmail || user?.email || ""}
        onSuccess={() => {
          setMessage("Google account linked successfully!");
          setTimeout(() => setMessage(""), 4000);
        }}
      />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#FF2638] uppercase tracking-widest">
          <Settings className="w-3.5 h-3.5" />
          <span>User Preferences & Biometric Targets</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
          Settings & Goals
        </h1>
        <p className="text-xs sm:text-sm text-[#999999] mt-1">
          Customize your biological metrics, daily targets, Google sync, and system appearance
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-[#B5121B]/20 border border-[#FF2638]/40 text-[#FF2638] text-xs font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(255,38,56,0.25)]">
          <Check className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* GOOGLE ACCOUNT INTEGRATION */}
      <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <GoogleIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Google Account Integration</h2>
              <p className="text-xs text-[#999999]">Link your Google profile for seamless authentication and identity sync</p>
            </div>
          </div>
          {isGoogleLinked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Connected</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#202020] text-[#999999] text-[11px]">
              Not Connected
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#101010] border border-[#292929]">
          <div>
            <p className="text-xs font-semibold text-white">
              {isGoogleLinked ? "Linked Google Profile" : "Connect with Google"}
            </p>
            <p className="text-xs text-[#999999] mt-0.5">
              {isGoogleLinked
                ? `Active Google identity: ${user?.googleEmail || user?.email}`
                : "Enable one-click Google Sign-In and future Health Connect sync."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isGoogleLinked ? (
              <button
                type="button"
                disabled={unlinkingGoogle}
                onClick={handleUnlinkGoogle}
                className="px-3.5 py-2 rounded-xl bg-[#202020] hover:bg-[#B5121B]/20 text-[#999999] hover:text-[#FF2638] border border-[#292929] hover:border-[#FF2638]/40 text-xs font-medium transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>{unlinkingGoogle ? "Unlinking..." : "Unlink Account"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-100 text-[#1f1f1f] text-xs font-bold transition-all shadow-[0_0_12px_rgba(255,255,255,0.2)] flex items-center gap-2"
              >
                <GoogleIcon className="w-3.5 h-3.5" />
                <LinkIcon className="w-3 h-3 text-neutral-600" />
                <span>Link Google Account</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* PROFILE INFORMATION */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#292929]">
            <UserIcon className="w-4 h-4 text-[#FF2638]" />
            <h2 className="text-sm font-bold text-white">Biometric Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">Account Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010]/50 border border-[#292929] text-xs text-[#666666] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">Age</label>
              <input
                type="number"
                min="10"
                max="120"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non_binary">Non-binary</option>
                <option value="not_specified">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">Height (cm)</label>
              <input
                type="number"
                min="50"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">Weight (kg)</label>
              <input
                type="number"
                min="30"
                max="300"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
              />
            </div>
          </div>
        </div>

        {/* CUSTOMIZABLE GOALS */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#292929]">
            <Target className="w-4 h-4 text-[#FF2638]" />
            <h2 className="text-sm font-bold text-white">Customizable Wellness Targets</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#FF2638] mb-1">
                Sleep Target (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="4"
                max="14"
                value={sleepTargetHours}
                onChange={(e) => setSleepTargetHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FF2638] mb-1">
                Daily Step Goal
              </label>
              <input
                type="number"
                step="500"
                min="1000"
                max="50000"
                value={stepGoal}
                onChange={(e) => setStepGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FF2638] mb-1">
                Water Target (ml)
              </label>
              <input
                type="number"
                step="100"
                min="500"
                max="6000"
                value={waterGoalMl}
                onChange={(e) => setWaterGoalMl(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FF2638] mb-1">
                Daily Calories (kcal)
              </label>
              <input
                type="number"
                step="50"
                min="1000"
                max="6000"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FF2638] mb-1">
                Protein Target (g)
              </label>
              <input
                type="number"
                step="5"
                min="20"
                max="300"
                value={proteinGoalG}
                onChange={(e) => setProteinGoalG(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FF2638] mb-1">
                Screen Time Limit (mins)
              </label>
              <input
                type="number"
                step="15"
                min="30"
                max="720"
                value={screenTimeLimitMinutes}
                onChange={(e) => setScreenTimeLimitMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white focus:outline-none focus:border-[#FF2638]"
              />
            </div>
          </div>
        </div>

        {/* PREFERENCES & DATA EXPORT */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#292929] space-y-4">
          <h2 className="text-sm font-bold text-white pb-3 border-b border-[#292929]">
            System Preferences & Data Backup
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-3.5 rounded-2xl bg-[#101010] hover:bg-[#1A0507] border border-[#292929] hover:border-[#FF2638]/40 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-white">Spider Cyber Theme</p>
                <p className="text-[11px] text-[#999999] capitalize">{theme} mode active</p>
              </div>
              {theme === "dark" ? <Moon className="w-4 h-4 text-[#FF2638]" /> : <Sun className="w-4 h-4 text-[#FF2638]" />}
            </button>

            <button
              type="button"
              onClick={handleRequestNotifications}
              className="p-3.5 rounded-2xl bg-[#101010] hover:bg-[#1A0507] border border-[#292929] hover:border-[#FF2638]/40 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-white">Browser Notifications</p>
                <p className="text-[11px] text-[#999999]">Bedtime & water prompts</p>
              </div>
              <Bell className="w-4 h-4 text-[#FF2638]" />
            </button>

            <a
              href="/api/export"
              download
              className="p-3.5 rounded-2xl bg-[#101010] hover:bg-[#1A0507] border border-[#292929] hover:border-[#FF2638]/40 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-white">Download Full Backup</p>
                <p className="text-[11px] text-[#999999]">Export complete JSON</p>
              </div>
              <Download className="w-4 h-4 text-[#FF2638]" />
            </a>
          </div>
        </div>

        {/* RESET DATA TO ZERO */}
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#B5121B]/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#FF2638]" />
                Reset App to Zero (Start Fresh)
              </h2>
              <p className="text-xs text-[#999999] mt-0.5">
                Clear all logged workouts, sleep logs, meals, water entries, and habit records to start completely clean.
              </p>
            </div>
          </div>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#101010] hover:bg-[#1A0507] border border-[#FF2638]/40 hover:border-[#FF2638] text-[#FF2638] text-xs font-bold transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Everything to Zero</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-[#1A0507] border border-[#FF2638]/60">
              <p className="text-xs font-bold text-white">
                ⚠️ Are you sure? This will wipe all existing logs and restore a clean zero state.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={resetting}
                  onClick={handleResetToZero}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white text-xs font-bold shadow-[0_0_12px_rgba(255,38,56,0.5)] transition-all"
                >
                  {resetting ? "Resetting..." : "Yes, Reset Everything"}
                </button>
                <button
                  type="button"
                  disabled={resetting}
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#101010] text-[#999999] hover:text-white text-xs border border-[#292929]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SAVE BUTTON */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2.5 rounded-2xl bg-[#B5121B]/15 hover:bg-[#B5121B]/25 text-[#FF2638] text-xs font-bold transition-colors border border-[#FF2638]/30"
          >
            Sign Out of Account
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white font-bold text-sm shadow-[0_0_15px_rgba(255,38,56,0.35)] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save All Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
