"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSleep } from "@/context/SleepContext";
import {
  LayoutDashboard,
  Moon,
  Activity,
  Utensils,
  Smartphone,
  CheckSquare,
  BarChart3,
  Settings,
  Sun,
  LogOut,
  Menu,
  X,
  Plus,
  Play,
  Heart,
  Radio,
  Sparkles,
} from "lucide-react";
import ActiveSleepModal from "@/components/sleep/ActiveSleepModal";
import LogActivityModal from "@/components/modals/LogActivityModal";
import LogFoodModal from "@/components/modals/LogFoodModal";
import FocusTimerModal from "@/components/modals/FocusTimerModal";
import CreateHabitModal from "@/components/modals/CreateHabitModal";
import SpiderWebCorner from "@/components/common/SpiderWebCorner";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/sleep", label: "Sleep Tracker", icon: Moon },
  { href: "/activity", label: "Activity & Steps", icon: Activity },
  { href: "/nutrition", label: "Nutrition", icon: Utensils },
  { href: "/screen-time", label: "Screen Time", icon: Smartphone },
  { href: "/habits", label: "Habit Tracker", icon: CheckSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isSleeping, elapsedSeconds, setShowSleepOverlay } = useSleep();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  // Modals
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);

  // Format sleep duration helper
  const hours = Math.floor(elapsedSeconds / 3600);
  const mins = Math.floor((elapsedSeconds % 3600) / 60);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-[#080808] text-[#F5F5F5] relative overflow-hidden">
        <SpiderWebCorner position="both" opacity={0.35} />
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5] spider-grid-overlay relative transition-colors duration-200 pointer-events-auto">
      {/* Spider Web Background Patterns */}
      <SpiderWebCorner position="both" opacity={0.3} />

      {/* Active Sleep Sanctuary Modal */}
      <ActiveSleepModal />

      {/* Quick Action Modals */}
      <LogActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onActivityLogged={() => router.refresh()}
      />
      <LogFoodModal
        isOpen={showFoodModal}
        onClose={() => setShowFoodModal(false)}
        onFoodLogged={() => router.refresh()}
      />
      <FocusTimerModal
        isOpen={showFocusModal}
        onClose={() => setShowFocusModal(false)}
        onSessionComplete={() => router.refresh()}
      />
      <CreateHabitModal
        isOpen={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        onHabitCreated={() => router.refresh()}
      />

      {/* Floating Active Sleep Status Banner */}
      {isSleeping && (
        <div className="fixed top-0 inset-x-0 z-40 bg-gradient-to-r from-[#101010]/95 via-[#1A0507]/95 to-[#101010]/95 backdrop-blur-md border-b border-[#FF2638]/40 py-2 px-4 shadow-[0_4px_20px_rgba(255,38,56,0.2)] flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2638] animate-ping" />
            <span className="font-semibold text-[#FF2638]">Spider Rest Mode Active:</span>
            <span className="font-mono text-white font-bold">
              {hours}h {mins}m elapsed
            </span>
          </div>
          <button
            onClick={() => setShowSleepOverlay(true)}
            className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white font-semibold text-xs transition-all shadow-[0_0_12px_rgba(255,38,56,0.4)]"
          >
            Open Night Screen &rarr;
          </button>
        </div>
      )}

      <div className={`flex min-h-screen relative z-10 pointer-events-auto ${isSleeping ? "pt-10" : ""}`}>
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#101010] border-r border-[#292929] p-5 shrink-0 sticky top-0 h-screen z-30 pointer-events-auto">
          {/* Spider Web Emblem Brand Logo */}
          <Link href="/" className="flex items-center gap-3 px-2 py-3 mb-6 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B5121B] via-[#FF2638] to-[#5C080D] flex items-center justify-center shadow-[0_0_16px_rgba(255,38,56,0.35)] group-hover:scale-105 transition-transform border border-[#FF2638]/40">
              {/* Spider Web icon */}
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" stroke="#FF2638" strokeWidth="1.2" strokeOpacity="0.8" />
                <polygon points="12,5 17,9 17,15 12,19 7,15 7,9" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <polygon points="12,8 15,10 15,14 12,16 9,14 9,10" stroke="#FF2638" strokeWidth="1" fill="none" />
                <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1" />
                <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" />
                <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#F5F5F5]">
                Life<span className="text-[#FF2638]">Sync</span>
              </span>
              <p className="text-[10px] uppercase tracking-widest text-[#FF2638] font-bold">
                SPIDER EDITION
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white shadow-[0_0_18px_rgba(255,38,56,0.35)] font-bold border border-[#FF2638]/50"
                      : "text-[#999999] hover:bg-[#151515] hover:text-[#F5F5F5] hover:border-[#292929] border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#999999]"}`} />
                  <span>{item.label}</span>
                  {item.href === "/sleep" && isSleeping && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-[#FF2638] animate-ping" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Action Trigger */}
          <div className="pt-4 border-t border-[#292929] mt-2">
            <button
              onClick={() => setQuickActionOpen(true)}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white text-xs font-bold shadow-[0_0_16px_rgba(255,38,56,0.35)] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Quick Log Activity / Meal</span>
            </button>
          </div>

          {/* User Profile Card */}
          <div className="pt-4 mt-4 border-t border-[#292929] flex items-center justify-between">
            <Link href="/settings" className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-85 transition-opacity">
              <div className="w-9 h-9 rounded-full bg-[#151515] border border-[#FF2638]/40 flex items-center justify-center text-[#FF2638] font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(255,38,56,0.2)]">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "LS"}
              </div>
              <div className="truncate pr-2">
                <p className="text-xs font-semibold text-[#F5F5F5] truncate">
                  {user?.name || "LifeSync User"}
                </p>
                <p className="text-[11px] text-[#999999] truncate">{user?.email}</p>
              </div>
            </Link>
            <button
              onClick={logout}
              className="p-1.5 rounded-xl hover:bg-rose-500/10 text-[#999999] hover:text-[#FF2638] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
          {/* TOP BAR */}
          <header className="h-16 px-4 sm:px-8 border-b border-[#292929] bg-[#080808]/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
            {/* Mobile Brand & Hamburger */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl bg-[#151515] text-[#999999] border border-[#292929]"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#B5121B] flex items-center justify-center text-white font-bold text-xs shadow-[0_0_10px_rgba(255,38,56,0.4)]">
                  LS
                </div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  Life<span className="text-[#FF2638]">Sync</span>
                </span>
              </Link>
            </div>

            {/* Current Section Title (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2638] shadow-[0_0_8px_#FF2638]" />
              <h1 className="text-sm font-semibold text-[#999999] tracking-wide uppercase">
                {NAV_ITEMS.find((n) => n.href === pathname)?.label || "Dashboard"}
              </h1>
            </div>

            {/* Right Tools: Quick Sleep Button, Quick Action, Theme */}
            <div className="flex items-center gap-2.5">
              {/* Quick Sleep Action */}
              <button
                onClick={() => {
                  if (isSleeping) {
                    setShowSleepOverlay(true);
                  } else {
                    router.push("/sleep");
                  }
                }}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isSleeping
                    ? "bg-[#1A0507] border-[#FF2638] text-[#FF2638] shadow-[0_0_14px_rgba(255,38,56,0.3)]"
                    : "bg-[#101010] border-[#292929] text-[#999999] hover:border-[#FF2638]/50 hover:text-white"
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-[#FF2638]" />
                <span>{isSleeping ? "Sleep Mode (Active)" : "Sleep Sanctuary"}</span>
              </button>

              {/* Theme Toggle (supports Red & Black dark mode) */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-2xl bg-[#101010] border border-[#292929] text-[#999999] hover:text-white hover:border-[#FF2638]/40 transition-colors"
                title={`Theme: ${theme} (Red & Black Cybernetic)`}
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-[#FF2638]" /> : <Moon className="w-4 h-4 text-[#FF2638]" />}
              </button>

              {/* Quick Add Button with Red Glow */}
              <button
                onClick={() => setQuickActionOpen(true)}
                className="p-2 rounded-2xl bg-[#B5121B]/15 border border-[#FF2638]/40 text-[#FF2638] hover:bg-[#FF2638]/25 hover:shadow-[0_0_12px_rgba(255,38,56,0.4)] transition-all"
                title="Quick Log"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* User Avatar (Mobile) */}
              <div className="lg:hidden">
                <Link
                  href="/settings"
                  className="w-8 h-8 rounded-full bg-[#151515] border border-[#FF2638]/50 flex items-center justify-center text-[#FF2638] font-bold text-xs"
                >
                  {user?.name ? user.name.slice(0, 1).toUpperCase() : "U"}
                </Link>
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10">
            {children}
          </main>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#101010]/95 backdrop-blur-xl border-t border-[#292929] py-2 px-3 flex items-center justify-around pointer-events-auto">
        {[
          { href: "/", label: "Overview", icon: LayoutDashboard },
          { href: "/sleep", label: "Sleep", icon: Moon },
          { href: "/activity", label: "Activity", icon: Activity },
          { href: "/nutrition", label: "Food", icon: Utensils },
          { href: "/habits", label: "Habits", icon: CheckSquare },
          { href: "/analytics", label: "Analytics", icon: BarChart3 },
        ].map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? "text-[#FF2638] font-bold scale-105"
                  : "text-[#999999] hover:text-[#F5F5F5]"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.href === "/sleep" && isSleeping && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FF2638] animate-ping" />
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-[#101010] border-r border-[#292929] p-6 flex flex-col justify-between shadow-2xl animate-slideRight">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#B5121B] to-[#FF2638] flex items-center justify-center text-white font-bold shadow-[0_0_12px_rgba(255,38,56,0.4)]">
                    LS
                  </div>
                  <div>
                    <span className="text-lg font-black text-white">
                      Life<span className="text-[#FF2638]">Sync</span>
                    </span>
                    <p className="text-[9px] uppercase tracking-widest text-[#FF2638] font-bold">
                      SPIDER EDITION
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-[#151515] text-[#999999]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#B5121B] to-[#FF2638] text-white font-bold shadow-[0_0_15px_rgba(255,38,56,0.35)]"
                          : "text-[#999999] hover:bg-[#151515] hover:text-[#F5F5F5]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-[#292929]">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#B5121B]/15 text-[#FF2638] hover:bg-[#B5121B]/25 text-xs font-semibold border border-[#FF2638]/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ACTION BOTTOM SHEET / MODAL */}
      {quickActionOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm bg-[#151515] border border-[#292929] rounded-3xl p-6 shadow-2xl text-[#F5F5F5] animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#292929] mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF2638] shadow-[0_0_8px_#FF2638]" />
                Quick Wellness Action
              </h3>
              <button
                onClick={() => setQuickActionOpen(false)}
                className="p-1 rounded-xl hover:bg-[#101010] text-[#999999]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  setShowActivityModal(true);
                }}
                className="p-3.5 rounded-2xl bg-[#101010] hover:bg-[#1A0507] border border-[#292929] hover:border-[#FF2638]/50 text-left transition-all group"
              >
                <Activity className="w-5 h-5 text-[#FF2638] mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-white">Log Activity</p>
                <p className="text-[10px] text-[#999999]">Workout, run, walk</p>
              </button>

              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  setShowFoodModal(true);
                }}
                className="p-3.5 rounded-2xl bg-[#101010] hover:bg-[#1A0507] border border-[#292929] hover:border-[#FF2638]/50 text-left transition-all group"
              >
                <Utensils className="w-5 h-5 text-[#FF2638] mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-white">Log Meal</p>
                <p className="text-[10px] text-[#999999]">Calories & macros</p>
              </button>

              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  setShowFocusModal(true);
                }}
                className="p-3.5 rounded-2xl bg-[#101010] hover:bg-[#1A0507] border border-[#292929] hover:border-[#FF2638]/50 text-left transition-all group"
              >
                <Play className="w-5 h-5 text-[#FF2638] mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-white">Focus Timer</p>
                <p className="text-[10px] text-[#999999]">Pomodoro & flow</p>
              </button>

              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  setShowHabitModal(true);
                }}
                className="p-3.5 rounded-2xl bg-[#101010] hover:bg-[#1A0507] border border-[#292929] hover:border-[#FF2638]/50 text-left transition-all group"
              >
                <CheckSquare className="w-5 h-5 text-[#FF2638] mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-white">New Habit</p>
                <p className="text-[10px] text-[#999999]">Build daily routine</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
