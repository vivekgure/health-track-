import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = getTodayString();
    const userProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    const stepGoal = userProfile?.stepGoal || 10000;

    // Get today's record or default
    let todayRecord = await prisma.dailyStep.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    if (!todayRecord) {
      todayRecord = await prisma.dailyStep.create({
        data: {
          userId: user.id,
          date: today,
          steps: 0,
          goal: stepGoal,
          distanceKm: 0,
          caloriesBurned: 0,
        },
      });
    }

    // Fetch past 14 days of steps
    const recentSteps = await prisma.dailyStep.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
      take: 14,
    });

    return NextResponse.json({
      today: todayRecord,
      goal: stepGoal,
      history: recentSteps,
    });
  } catch (err: unknown) {
    console.error("Steps GET error:", err);
    return NextResponse.json({ error: "Failed to fetch steps" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const today = body.date || getTodayString();
    const stepsToAdd = Number(body.steps || 0);
    const setAbsolute = Boolean(body.setAbsolute);

    const userProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    const currentGoal = body.goal ? Number(body.goal) : userProfile?.stepGoal || 10000;

    // Check existing record
    const existing = await prisma.dailyStep.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    let newTotalSteps = stepsToAdd;
    if (existing && !setAbsolute) {
      newTotalSteps = existing.steps + stepsToAdd;
    }

    // Formulas:
    // Avg stride distance: 0.00078 km per step
    // Avg active calories: 0.045 kcal per step
    const distanceKm = Number((newTotalSteps * 0.00078).toFixed(2));
    const caloriesBurned = Math.round(newTotalSteps * 0.045);

    const record = await prisma.dailyStep.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      create: {
        userId: user.id,
        date: today,
        steps: newTotalSteps,
        goal: currentGoal,
        distanceKm,
        caloriesBurned,
      },
      update: {
        steps: newTotalSteps,
        distanceKm,
        caloriesBurned,
        goal: currentGoal,
      },
    });

    // Check if goal met
    if (newTotalSteps >= currentGoal && (!existing || existing.steps < currentGoal)) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Step Goal Reached! 🏆",
          message: `Incredible! You crushed your daily target of ${currentGoal.toLocaleString()} steps with ${newTotalSteps.toLocaleString()} steps today!`,
          type: "success",
        },
      });
    }

    return NextResponse.json({ success: true, record });
  } catch (err: unknown) {
    console.error("Steps POST error:", err);
    return NextResponse.json({ error: "Failed to update steps" }, { status: 500 });
  }
}

