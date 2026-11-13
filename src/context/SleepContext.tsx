"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
        setActiveSession(data.activeSession);
        setPastSessions(data.pastSessions || []);
        setStats(data.stats || null);

        if (data.activeSession) {
          const startMs = new Date(data.activeSession.startTime).getTime();
          const elapsed = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
          setElapsedSeconds(elapsed);
        } else {
          setElapsedSeconds(0);
        }
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

  const stopSleep = async (qualityRating = 4, notes = "") => {
    try {
      const res = await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop", qualityRating, notes }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to stop sleep session" };
      }

      setActiveSession(null);
      setElapsedSeconds(0);
      setShowSleepOverlay(false);
      await refreshSleepData();
      return { success: true, session: data.session };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const cancelSleep = async () => {
    try {
      await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      setActiveSession(null);
      setElapsedSeconds(0);
      setShowSleepOverlay(false);
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
      return { success: false, error: "Network error" };
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

