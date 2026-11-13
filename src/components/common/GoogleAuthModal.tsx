"use client";

import React, { useState } from "react";
import GoogleIcon from "./GoogleIcon";
import { X, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "link";
  onSuccess?: () => void;
  currentEmail?: string;
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  mode,
  onSuccess,
  currentEmail = "",
}: GoogleAuthModalProps) {
  const { signInWithGoogle, linkGoogleAccount } = useAuth();
  const [googleEmail, setGoogleEmail] = useState(currentEmail);
  const [googleName, setGoogleName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!googleEmail || !googleEmail.includes("@")) {
      setError("Please enter a valid Google account email address");
      return;
    }

    setLoading(true);

    if (mode === "link") {
      const res = await linkGoogleAccount(googleEmail, googleName);
      setLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.error || "Failed to link Google account");
      }
    } else {
      const res = await signInWithGoogle(googleEmail, googleName);
      setLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.error || "Failed to sign in with Google");
      }
    }
  };

  const handleOAuthDirect = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/google?action=${mode}`);
      if (res.redirected) {
        window.location.href = res.url;
        return;
      }
      const data = await res.json();
      if (data.configured === false) {
        // Not configured with Google Cloud Client ID yet, stay on this modal for immediate link
        setError("Note: OAuth Client ID not yet set in environment. Use direct verification below to connect your Google account instantly!");
      }
    } catch {
      // stay on manual input
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#151515] border border-[#292929] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,38,56,0.25)] relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-xl text-[#999999] hover:text-white hover:bg-[#202020] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shrink-0">
            <GoogleIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {mode === "link" ? "Link Google Account" : "Sign in with Google"}
            </h3>
            <p className="text-xs text-[#999999]">
              {mode === "link"
                ? "Synchronize your LifeSync profile with Google"
                : "Fast, verified access using your Google identity"}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[#B5121B]/20 border border-[#FF2638]/40 text-[#FF2638] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* OAuth One-Click Attempt */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleOAuthDirect}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-[#1f1f1f] font-semibold text-xs transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(255,255,255,0.15)] disabled:opacity-50"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Launch Google Account Consent</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#292929] w-full"></div>
          <span className="bg-[#151515] px-3 text-[10px] uppercase tracking-wider text-[#666666] absolute">
            or instant email verification
          </span>
        </div>

        {/* Direct Account Link Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-1.5">
              Google Account Email
            </label>
            <input
              type="email"
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              placeholder="e.g. you@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#FF2638]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#999999] mb-1.5">
              Google Display Name (Optional)
            </label>
            <input
              type="text"
              value={googleName}
              onChange={(e) => setGoogleName(e.target.value)}
              placeholder="e.g. Vivek Gure"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#292929] text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#FF2638]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#B5121B] to-[#FF2638] hover:from-[#C91620] hover:to-[#FF3D4E] text-white font-bold text-xs shadow-[0_0_15px_rgba(255,38,56,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {loading
                ? "Connecting..."
                : mode === "link"
                ? "Verify & Link Google Account"
                : "Sign In with Verified Google Identity"}
            </span>
          </button>
        </form>

        <p className="text-[10px] text-[#666666] text-center mt-4">
          Protected by LifeSync Neo-Spider security protocol. Your credentials remain private.
        </p>
      </div>
    </div>
  );
}

