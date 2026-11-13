import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Check for active (in-progress) sleep session
    const activeSession = await prisma.sleepSession.findFirst({
      where: {
        userId: user.id,
        isCompleted: false,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    // 2. Fetch past completed sessions
    const pastSessions = await prisma.sleepSession.findMany({
      where: {
        userId: user.id,
        isCompleted: true,
      },
      orderBy: {
        startTime: "desc",
      },
      take: 30,
    });

    // 3. Calculate statistics
    let avgDurationMinutes = 0;
    let avgQuality = 0;
    let consistencyScore = 0; // 0 baseline when no sessions tracked

    if (pastSessions.length > 0) {
      const validDurationSessions = pastSessions.filter((s) => s.durationMinutes && s.durationMinutes > 0);
      if (validDurationSessions.length > 0) {
        avgDurationMinutes = Math.round(
          validDurationSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) /
            validDurationSessions.length
        );
      }

      const ratedSessions = pastSessions.filter((s) => s.qualityRating && s.qualityRating > 0);
      if (ratedSessions.length > 0) {
        avgQuality = Number(
          (
            ratedSessions.reduce((acc, s) => acc + (s.qualityRating || 0), 0) /
            ratedSessions.length
          ).toFixed(1)
        );
      }

      // Calculate schedule consistency based on bedtime variance in recent 7 days
      const recentSessions = pastSessions.slice(0, 7);
      if (recentSessions.length >= 2) {
        const bedtimesInMinutes = recentSessions.map((s) => {
          const d = new Date(s.startTime);
          let mins = d.getHours() * 60 + d.getMinutes();
          // Adjust for night hours (e.g. 23:00 is 1380, 01:00 is 1500)
          if (mins < 720) mins += 1440;
          return mins;
        });

        const meanBedtime = bedtimesInMinutes.reduce((a, b) => a + b, 0) / bedtimesInMinutes.length;
        const variance =
          bedtimesInMinutes.reduce((acc, val) => acc + Math.pow(val - meanBedtime, 2), 0) /
          bedtimesInMinutes.length;
        const stdDevMins = Math.sqrt(variance);

        // Standard deviation under 30 mins = 95+ score; over 120 mins = lower score
        consistencyScore = Math.max(50, Math.min(100, Math.round(100 - (stdDevMins / 90) * 40)));
      }
    }

    return NextResponse.json({
      activeSession: activeSession
        ? {
            ...activeSession,
            elapsedSeconds: Math.max(
              0,
              Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000)
            ),
          }
        : null,
      pastSessions,
      stats: {
        avgDurationMinutes,
        avgHours: Number((avgDurationMinutes / 60).toFixed(1)),
        avgQuality,
        consistencyScore,
        totalSessions: pastSessions.length,
      },
    });
  } catch (err: unknown) {
    console.error("Sleep GET error:", err);
    return NextResponse.json({ error: "Failed to fetch sleep data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || "start";

    // A. START SLEEP SESSION
    if (action === "start") {
      // Check if user already has an active session
      const existing = await prisma.sleepSession.findFirst({
        where: {
          userId: user.id,
          isCompleted: false,
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            error: "You already have an active sleep session in progress",
            activeSession: existing,
          },
          { status: 409 }
        );
      }

      // Create new session starting now
      const session = await prisma.sleepSession.create({
        data: {
          userId: user.id,
          startTime: new Date(),
          isCompleted: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Sleep session started",
        session: {
          ...session,
          elapsedSeconds: 0,
        },
      });
    }

    // B. STOP SLEEP SESSION
    if (action === "stop") {
      const activeSession = await prisma.sleepSession.findFirst({
        where: {
          userId: user.id,
          isCompleted: false,
        },
      });

      if (!activeSession) {
        return NextResponse.json(
          { error: "No active sleep session found to stop" },
          { status: 404 }
        );
      }

      const endTime = new Date();
      const startTime = new Date(activeSession.startTime);
      // Duration in minutes (at least 1 minute)
      const durationMinutes = Math.max(
        1,
        Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
      );

      const qualityRating = body.qualityRating ? Number(body.qualityRating) : 4;
      const notes = body.notes || "";

      // Calculate consistency vs 8h target
      const targetMins = 8 * 60;
      const diffMins = Math.abs(durationMinutes - targetMins);
      const consistency = Math.max(50, Math.min(100, Math.round(100 - (diffMins / targetMins) * 50)));

      const completedSession = await prisma.sleepSession.update({
        where: { id: activeSession.id },
        data: {
          endTime,
          durationMinutes,
          qualityRating,
          sleepConsistency: consistency,
          notes,
          isCompleted: true,
        },
      });

      // Add a celebration notification if good sleep
      if (durationMinutes >= 420) { // 7+ hours
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "Sleep Target Achieved 🌙",
            message: `You slept for ${(durationMinutes / 60).toFixed(1)} hours with a quality rating of ${qualityRating}/5!`,
            type: "success",
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Sleep session completed successfully",
        session: completedSession,
      });
    }

    // C. CANCEL ACTIVE SESSION
    if (action === "cancel") {
      await prisma.sleepSession.deleteMany({
        where: {
          userId: user.id,
          isCompleted: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Active sleep session discarded",
      });
    }

    // D. MANUAL SLEEP ENTRY
    if (action === "manual") {
      const { startTimeStr, endTimeStr, qualityRating, notes } = body;

      if (!startTimeStr || !endTimeStr) {
        return NextResponse.json(
          { error: "Start and end timestamps are required" },
          { status: 400 }
        );
      }

      const start = new Date(startTimeStr);
      let end = new Date(endTimeStr);

      // Handle crossing midnight automatically:
      // If end time is earlier in the day than start time, add 1 day to end time
      if (end.getTime() <= start.getTime()) {
        end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
      }

      const durationMinutes = Math.max(
        1,
        Math.round((end.getTime() - start.getTime()) / (1000 * 60))
      );

      const session = await prisma.sleepSession.create({
        data: {
          userId: user.id,
          startTime: start,
          endTime: end,
          durationMinutes,
          qualityRating: qualityRating ? Number(qualityRating) : 4,
          sleepConsistency: 85,
          notes: notes || "Manually logged sleep session",
          isCompleted: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Sleep session logged manually",
        session,
      });
    }

    // E. RESET ALL SLEEP DATA (Sessions, active timer, and averages)
    if (action === "reset") {
      await prisma.sleepSession.deleteMany({
        where: { userId: user.id },
      });

      return NextResponse.json({
        success: true,
        message: "All sleep sessions, records, and active timers reset to zero",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Sleep POST error:", err);
    return NextResponse.json({ error: "Failed to process sleep request" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all");

    if (all === "true") {
      await prisma.sleepSession.deleteMany({
        where: { userId: user.id },
      });
      return NextResponse.json({ success: true, message: "All sleep sessions cleared and reset to zero" });
    }

    if (!id) {
      return NextResponse.json({ error: "Session ID or all=true required" }, { status: 400 });
    }

    await prisma.sleepSession.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Sleep session deleted" });
  } catch (err: unknown) {
    console.error("Sleep DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}

