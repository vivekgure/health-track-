import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function getPastDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayStr = formatDate(new Date());

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    // 1. Sleep: check active session + last completed session
    const activeSleep = await prisma.sleepSession.findFirst({
      where: { userId: user.id, isCompleted: false },
    });

    const lastSleep = await prisma.sleepSession.findFirst({
      where: { userId: user.id, isCompleted: true },
      orderBy: { startTime: "desc" },
    });

    // 2. Steps today
    const stepRecord = await prisma.dailyStep.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: todayStr,
        },
      },
    });

    // 3. Nutrition & Water today
    const foodEntries = await prisma.foodEntry.findMany({
      where: { userId: user.id, date: todayStr },
    });

    const totalCals = foodEntries.reduce((acc, f) => acc + f.calories, 0);
    const totalProtein = Math.round(foodEntries.reduce((acc, f) => acc + f.proteinG, 0));
    const totalCarbs = Math.round(foodEntries.reduce((acc, f) => acc + f.carbsG, 0));
    const totalFat = Math.round(foodEntries.reduce((acc, f) => acc + f.fatG, 0));
    const totalFiber = Math.round(foodEntries.reduce((acc, f) => acc + f.fiberG, 0));

    const waterLogs = await prisma.waterLog.findMany({
      where: { userId: user.id, date: todayStr },
    });
    const totalWaterMl = waterLogs.reduce((acc, w) => acc + w.amountMl, 0);

    // 4. Screen time today
    const screenRecords = await prisma.screenTimeRecord.findMany({
      where: { userId: user.id, date: todayStr },
    });
    const totalScreenMinutes = screenRecords.reduce((acc, s) => acc + s.durationMinutes, 0);
    const productiveMinutes = screenRecords
      .filter((s) => s.isProductive || s.category === "Productivity")
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    // 5. Habits today
    const habits = await prisma.habit.findMany({
      where: { userId: user.id, archived: false },
      include: {
        completions: {
          where: { date: todayStr },
        },
      },
    });

    const habitItems = habits.map((h) => ({
      id: h.id,
      title: h.title,
      category: h.category,
      color: h.color,
      icon: h.icon,
      completedToday: h.completions.length > 0,
    }));

    // 6. Last 7 days overview trend
    const weeklyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = getPastDate(i);
      const dStr = formatDate(d);
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

      const dayStep = await prisma.dailyStep.findUnique({
        where: { userId_date: { userId: user.id, date: dStr } },
      });

      const dayFoods = await prisma.foodEntry.findMany({
        where: { userId: user.id, date: dStr },
      });
      const cals = dayFoods.reduce((acc, f) => acc + f.calories, 0);

      weeklyTrends.push({
        day: dayLabel,
        date: dStr,
        steps: dayStep?.steps || 0,
        calories: cals,
      });
    }

    // 7. Notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      profile,
      todayStr,
      sleep: {
        isSleeping: !!activeSleep,
        activeSession: activeSleep
          ? {
              ...activeSleep,
              elapsedSeconds: Math.floor(
                (Date.now() - new Date(activeSleep.startTime).getTime()) / 1000
              ),
            }
          : null,
        lastSession: lastSleep
          ? {
              ...lastSleep,
              durationHours: lastSleep.durationMinutes
                ? Number((lastSleep.durationMinutes / 60).toFixed(1))
                : 0,
            }
          : null,
        targetHours: profile?.sleepTargetHours || 8.0,
      },
      steps: {
        current: stepRecord?.steps || 0,
        goal: profile?.stepGoal || 10000,
        distanceKm: stepRecord?.distanceKm || 0,
        caloriesBurned: stepRecord?.caloriesBurned || 0,
        progress: Math.min(100, Math.round(((stepRecord?.steps || 0) / (profile?.stepGoal || 10000)) * 100)),
      },
      nutrition: {
        calories: totalCals,
        calorieGoal: profile?.calorieGoal || 2200,
        protein: totalProtein,
        proteinGoal: profile?.proteinGoalG || 120,
        carbs: totalCarbs,
        carbsGoal: profile?.carbsGoalG || 250,
        fat: totalFat,
        fatGoal: profile?.fatGoalG || 65,
        fiber: totalFiber,
        waterMl: totalWaterMl,
        waterGoalMl: profile?.waterGoalMl || 2500,
      },
      screenTime: {
        totalMinutes: totalScreenMinutes,
        totalHours: Number((totalScreenMinutes / 60).toFixed(1)),
        limitMinutes: profile?.screenTimeLimitMinutes || 240,
        limitHours: Number(((profile?.screenTimeLimitMinutes || 240) / 60).toFixed(1)),
        productivityRatio:
          totalScreenMinutes > 0
            ? Math.round((productiveMinutes / totalScreenMinutes) * 100)
            : 100,
      },
      habits: {
        total: habitItems.length,
        completed: habitItems.filter((h) => h.completedToday).length,
        list: habitItems,
      },
      weeklyTrends,
      notifications: {
        unreadCount,
        list: notifications,
      },
    });
  } catch (err: unknown) {
    console.error("Overview GET error:", err);
    return NextResponse.json({ error: "Failed to fetch overview data" }, { status: 500 });
  }
}

