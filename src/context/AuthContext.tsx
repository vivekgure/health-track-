"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface Profile {
  id: string;
  userId: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  sleepTargetHours: number;
  stepGoal: number;
  waterGoalMl: number;
  calorieGoal: number;
  proteinGoalG: number;
  carbsGoalG: number;
  fatGoalG: number;
  screenTimeLimitMinutes: number;
  themePreference: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  googleId?: string | null;
  googleEmail?: string | null;
  avatar?: string | null;
  profile?: Profile | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  quickDemoLogin: () => Promise<boolean>;
  signInWithGoogle: (email: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  linkGoogleAccount: (email: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  unlinkGoogleAccount: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile> & { name?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to sign in" };
      }

      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: "Network error during sign in" };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to create account" };
      }

      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: "Network error during registration" };
    }
  };

  const signInWithGoogle = async (email: string, name?: string) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, action: "signin" }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Google authentication failed" };
      }

      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: "Network error during Google sign in" };
    }
  };

  const linkGoogleAccount = async (email: string, name?: string) => {
    try {
      const res = await fetch("/api/auth/google/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to link Google account" };
      }

      await refreshUser();
      return { success: true };
    } catch {
      return { success: false, error: "Network error linking Google account" };
    }
  };

  const unlinkGoogleAccount = async () => {
    try {
      const res = await fetch("/api/auth/google/link", {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to unlink Google account" };
      }

      await refreshUser();
      return { success: true };
    } catch {
      return { success: false, error: "Network error unlinking Google account" };
    }
  };

  const quickDemoLogin = async () => {
    const res = await login("demo@lifesync.app", "password123");
    if (res.success) {
      router.push("/");
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    router.push("/login");
  };

  const updateProfile = async (profileData: Partial<Profile> & { name?: string }) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to update profile" };
      }

      await refreshUser();
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        quickDemoLogin,
        signInWithGoogle,
        linkGoogleAccount,
        unlinkGoogleAccount,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
