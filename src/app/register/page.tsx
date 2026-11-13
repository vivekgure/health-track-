"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SpiderWebCorner from "@/components/common/SpiderWebCorner";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setError(res.error || "Failed to create account");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080808] text-[#F5F5F5] relative overflow-hidden">
      <SpiderWebCorner position="both" opacity={0.35} />

      <div className="w-full max-w-md bg-[#151515] border border-[#292929] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#B5121B] via-[#FF2638] to-[#5C080D] mb-3 shadow-[0_0_15px_rgba(255,38,56,0.4)] border border-[#FF2638]/40">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" stroke="#FF2638" strokeWidth="1.2" strokeOpacity="0.8" />
              <polygon points="12,5 17,9 17,15 12,19 7,15 7,9" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white">Join LifeSync</h1>
          <p className="text-xs text-[#999999] mt-1">Initialize your spider web wellness protocol</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[#B5121B]/20 border border-[#FF2638]/40 text-[#FF2638] text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Lee"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#FF2638]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#999999] mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jordan@example.com"
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
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#FF2638]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white font-bold text-sm shadow-[0_0_15px_rgba(255,38,56,0.35)] transition-all disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create LifeSync Account"}
          </button>
        </form>

        <p className="text-center text-xs text-[#999999] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#FF2638] font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
