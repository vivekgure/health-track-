import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Delete all user logs
    await prisma.sleepSession.deleteMany({ where: { userId: user.id } });
    await prisma.activityRecord.deleteMany({ where: { userId: user.id } });
    await prisma.dailyStep.deleteMany({ where: { userId: user.id } });
    await prisma.foodEntry.deleteMany({ where: { userId: user.id } });
    await prisma.waterLog.deleteMany({ where: { userId: user.id } });
    await prisma.screenTimeRecord.deleteMany({ where: { userId: user.id } });
    await prisma.focusSession.deleteMany({ where: { userId: user.id } });
    await prisma.habitCompletion.deleteMany({ where: { userId: user.id } });
    await prisma.habit.deleteMany({ where: { userId: user.id } });
    await prisma.notification.deleteMany({ where: { userId: user.id } });

    // 2. Reset Profile Goals to fresh standard defaults
    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        sleepTargetHours: 8.0,
        stepGoal: 10000,
        waterGoalMl: 2500,
        calorieGoal: 2000,
        proteinGoalG: 120,
        carbsGoalG: 220,
        fatGoalG: 60,
        screenTimeLimitMinutes: 240,
        themePreference: "dark",
      },
      update: {
        sleepTargetHours: 8.0,
        stepGoal: 10000,
        waterGoalMl: 2500,
        calorieGoal: 2000,
        proteinGoalG: 120,
        carbsGoalG: 220,
        fatGoalG: 60,
        screenTimeLimitMinutes: 240,
      },
    });

    // 3. Create fresh starter habits
    const starterHabits = [
      { title: "Morning Sunlight & Hydration", category: "wellness", color: "#FF2638", icon: "Sun", targetDaysPerWeek: 7 },
      { title: "Walk 10,000 Steps", category: "fitness", color: "#FF2638", icon: "Activity", targetDaysPerWeek: 7 },
      { title: "Balanced Whole-Food Meals", category: "wellness", color: "#FF2638", icon: "Utensils", targetDaysPerWeek: 7 },
      { title: "Deep Work Focus Session", category: "productivity", color: "#FF2638", icon: "Zap", targetDaysPerWeek: 5 },
      { title: "Sleep Protocol (8 Hours Rest)", category: "wellness", color: "#FF2638", icon: "Moon", targetDaysPerWeek: 7 },
    ];

    for (const h of starterHabits) {
      await prisma.habit.create({
        data: {
          userId: user.id,
          ...h,
        },
      });
    }

    // 4. Create fresh welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "LifeSync Reset Complete",
        message: "All metrics have been reset to zero. Your fresh wellness tracking journey starts right now!",
        type: "system",
        isRead: false,
      },
    });

    return NextResponse.json({ success: true, message: "Application data reset to zero successfully" });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json({ error: "Failed to reset application data" }, { status: 500 });
  }
}
