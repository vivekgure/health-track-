"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";

export interface SleepSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string | null;
  durationMinutes?: number | null;
  qualityRating?: number | null;
  sleepConsistency?: number | null;
  notes?: string | null;
  isCompleted: boolean;
  elapsedSeconds?: number;
}

interface SleepStats {
  avgDurationMinutes: number;
  avgHours: number;
  avgQuality: number;
  consistencyScore: number;
  totalSessions: number;
}

interface SleepContextType {
  isSleeping: boolean;
  activeSession: SleepSession | null;
  elapsedSeconds: number;
  pastSessions: SleepSession[];
  stats: SleepStats | null;
  loading: boolean;
  showSleepOverlay: boolean;
  setShowSleepOverlay: (show: boolean) => void;
  startSleep: () => Promise<{ success: boolean; error?: string }>;
  stopSleep: (qualityRating?: number, notes?: string) => Promise<{ success: boolean; session?: SleepSession; error?: string }>;
  cancelSleep: () => Promise<void>;
  refreshSleepData: () => Promise<void>;
  logManualSleep: (data: { startTimeStr: string; endTimeStr: string; qualityRating?: number; notes?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteSleepSession: (id: string) => Promise<boolean>;
  resetSleepData: () => Promise<{ success: boolean; error?: string }>;
}

const SleepContext = createContext<SleepContextType | undefined>(undefined);

export function SleepProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<SleepSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pastSessions, setPastSessions] = useState<SleepSession[]>([]);
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSleepOverlay, setShowSleepOverlay] = useState(false);

  // Timestamp guard to prevent stale server responses right after stopping
  const lastStoppedAtRef = useRef<number>(0);

  const refreshSleepData = useCallback(async () => {
    if (!user) {
      setActiveSession(null);
      setPastSessions([]);
      setStats(null);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/sleep");
      if (res.ok) {
        const data = await res.json();

        // If stopped within the last 5 seconds, ensure activeSession stays null
        const justStopped = Date.now() - lastStoppedAtRef.current < 5000;
        if (justStopped) {
          setActiveSession(null);
          setElapsedSeconds(0);
        } else {
          setActiveSession(data.activeSession);
          if (data.activeSession) {
            const startMs = new Date(data.activeSession.startTime).getTime();
            const elapsed = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
            setElapsedSeconds(elapsed);
          } else {
            setElapsedSeconds(0);
          }
        }

        setPastSessions(data.pastSessions || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error("Error fetching sleep data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSleepData();
  }, [refreshSleepData]);

  // Live timer interval while an active session exists
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const startMs = new Date(activeSession.startTime).getTime();
      const elapsed = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const startSleep = async () => {
    try {
      lastStoppedAtRef.current = 0;
      const res = await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to start sleep session" };
      }

      setActiveSession(data.session);
      setElapsedSeconds(0);
      setShowSleepOverlay(true);
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const stopSleep = async (qualityRating = 5, notes = "") => {
    // 1. INSTANT OPTIMISTIC OFF - The exact moment the user clicks Stop!
    lastStoppedAtRef.current = Date.now();
    const prevSession = activeSession;
    setActiveSession(null);
    setElapsedSeconds(0);
    setShowSleepOverlay(false);

    try {
      const res = await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop", qualityRating, notes }),
      });

      const data = await res.json();
      // Refresh past sessions & stats in the background
      await refreshSleepData();
      return { success: true, session: data.session || prevSession || undefined };
    } catch {
      // Even if background network fails, keep it off locally
      return { success: true };
    }
  };

  const cancelSleep = async () => {
    // Instant off
    lastStoppedAtRef.current = Date.now();
    setActiveSession(null);
    setElapsedSeconds(0);
    setShowSleepOverlay(false);

    try {
      await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      await refreshSleepData();
    } catch (err) {
      console.error("Cancel sleep error:", err);
    }
  };

  const logManualSleep = async (data: {
    startTimeStr: string;
    endTimeStr: string;
    qualityRating?: number;
    notes?: string;
  }) => {
    try {
      const res = await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "manual", ...data }),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || "Failed to log sleep" };
      }

      await refreshSleepData();
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const deleteSleepSession = async (id: string) => {
    try {
      const res = await fetch(`/api/sleep?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await refreshSleepData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetSleepData = async () => {
    try {
      const res = await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to reset sleep data" };
      }

      lastStoppedAtRef.current = Date.now();
      setActiveSession(null);
      setElapsedSeconds(0);
      setShowSleepOverlay(false);
      setPastSessions([]);
      setStats({
        avgDurationMinutes: 0,
        avgHours: 0,
        avgQuality: 0,
        consistencyScore: 0,
        totalSessions: 0,
      });

      return { success: true };
    } catch {
      return { success: false, error: "Network error resetting sleep data" };
    }
  };

  return (
    <SleepContext.Provider
      value={{
        isSleeping: !!activeSession,
        activeSession,
        elapsedSeconds,
        pastSessions,
        stats,
        loading,
        showSleepOverlay,
        setShowSleepOverlay,
        startSleep,
        stopSleep,
        cancelSleep,
        refreshSleepData,
        logManualSleep,
        deleteSleepSession,
        resetSleepData,
      }}
    >
      {children}
    </SleepContext.Provider>
  );
}

export function useSleep() {
  const context = useContext(SleepContext);
  if (!context) {
    throw new Error("useSleep must be used within a SleepProvider");
  }
  return context;
}
