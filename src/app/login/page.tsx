"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Moon, Activity, Utensils, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import SpiderWebCorner from "@/components/common/SpiderWebCorner";
import RedEmbers from "@/components/common/RedEmbers";

export default function LoginPage() {
  const router = useRouter();
  const { login, quickDemoLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      router.push("/");
    } else {
      setError(res.error || "Invalid credentials");
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setDemoLoading(true);
    const success = await quickDemoLogin();
    setDemoLoading(false);
    if (!success) {
      setError("Demo account login failed. Please try registering an account.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080808] text-[#F5F5F5] relative overflow-hidden">
      <SpiderWebCorner position="both" opacity={0.35} />
      <RedEmbers count={6} />

      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-[#151515] border border-[#292929] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-xl relative z-10">
        {/* Left Column: Visual Brand Pitch */}
        <div className="p-8 sm:p-10 bg-gradient-to-br from-[#101010] via-[#151515] to-[#1A0507] border-r border-[#292929] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B5121B] via-[#FF2638] to-[#5C080D] flex items-center justify-center shadow-[0_0_15px_rgba(255,38,56,0.4)] border border-[#FF2638]/40">
                {/* Spider Web icon */}
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" stroke="#FF2638" strokeWidth="1.2" strokeOpacity="0.8" />
                  <polygon points="12,5 17,9 17,15 12,19 7,15 7,9" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1" />
                  <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" />
                  <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white">
                  Life<span className="text-[#FF2638]">Sync</span>
                </span>
                <p className="text-[9px] uppercase tracking-widest text-[#FF2638] font-bold">
                  NEO SPIDER EDITION
                </p>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
              Master Your Wellness & Daily Momentum
            </h1>
            <p className="text-sm text-[#999999] leading-relaxed mb-8">
              A futuristic personal wellness & productivity platform with active sleep tracking, step cadence, macro food diary, and mindful focus sessions.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638] shrink-0 border border-[#FF2638]/30">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Real Sleep Tracking Sanctuary</h4>
                  <p className="text-[11px] text-[#999999]">Start/stop mode, cross-midnight calculations, and consistency score.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638] shrink-0 border border-[#FF2638]/30">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Activity & Step Counters</h4>
                  <p className="text-[11px] text-[#999999]">Cadence tracking, workout logging, and Google/Apple Health sync readiness.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#B5121B]/20 text-[#FF2638] shrink-0 border border-[#FF2638]/30">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Full Macro Food Diary</h4>
                  <p className="text-[11px] text-[#999999]">Calorie tracking, protein, carbs, fat, fiber & hydration logs.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[#292929] text-xs text-[#999999] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF2638]" />
            <span>Encrypted local database & secure sessions</span>
          </div>
        </div>

        {/* Right Column: Login Form & Instant Demo */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-[#151515]">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Welcome Back</h2>
            <p className="text-xs text-[#999999] mt-1">Sign in to your LifeSync command center</p>
          </div>

          {/* Quick Demo Login Pill */}
          <div className="mb-6 p-4 rounded-2xl bg-[#101010] border border-[#292929] hover:border-[#FF2638]/40 text-center transition-all">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#FF2638] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF2638]" />
              <span>One-Click Evaluation Demo</span>
            </div>
            <p className="text-[11px] text-[#999999] mb-3">
              Explore LifeSync immediately with pre-populated demo data (Alex Morgan).
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white font-bold text-xs shadow-[0_0_15px_rgba(255,38,56,0.35)] transition-all flex items-center justify-center gap-2"
            >
              <span>{demoLoading ? "Logging in..." : "⚡ Launch Demo Dashboard"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-[#292929] w-full"></div>
            <span className="bg-[#151515] px-3 text-[11px] uppercase tracking-wider text-[#666666] absolute">
              or sign in with email
            </span>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-[#B5121B]/20 border border-[#FF2638]/40 text-[#FF2638] text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#FF2638]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#FF2638]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white font-bold text-sm shadow-[0_0_15px_rgba(255,38,56,0.35)] transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In to LifeSync"}
            </button>
          </form>

          <p className="text-center text-xs text-[#999999] mt-6">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="text-[#FF2638] font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
