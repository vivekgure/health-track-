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

    const { searchParams } = new URL(request.url);
    const rangeDays = parseInt(searchParams.get("days") || "7", 10);
    const safeDays = [7, 30, 90].includes(rangeDays) ? rangeDays : 7;

    const startDate = getPastDate(safeDays);
    const startDateStr = formatDate(startDate);

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    const stepGoal = profile?.stepGoal || 10000;
    const sleepTargetHours = profile?.sleepTargetHours || 8.0;
    const calorieGoal = profile?.calorieGoal || 2200;
    const screenTimeLimitMinutes = profile?.screenTimeLimitMinutes || 240;

    // 1. Fetch Sleep Sessions
    const sleepSessions = await prisma.sleepSession.findMany({
      where: {
        userId: user.id,
        isCompleted: true,
        startTime: { gte: startDate },
      },
      orderBy: { startTime: "asc" },
    });

    // 2. Fetch Daily Steps
    const dailySteps = await prisma.dailyStep.findMany({
      where: {
        userId: user.id,
        date: { gte: startDateStr },
      },
      orderBy: { date: "asc" },
    });

    // 3. Fetch Nutrition Entries
    const foodEntries = await prisma.foodEntry.findMany({
      where: {
        userId: user.id,
        date: { gte: startDateStr },
      },
      orderBy: { date: "asc" },
    });

    // 4. Fetch Screen Time Records
    const screenTimeRecords = await prisma.screenTimeRecord.findMany({
      where: {
        userId: user.id,
        date: { gte: startDateStr },
      },
      orderBy: { date: "asc" },
    });

    // 5. Fetch Habits and Completions
    const habits = await prisma.habit.findMany({
      where: { userId: user.id, archived: false },
      include: {
        completions: {
          where: { date: { gte: startDateStr } },
        },
      },
    });

    // Build day-by-day unified timeline
    const timeline = [];
    for (let i = safeDays - 1; i >= 0; i--) {
      const d = getPastDate(i);
      const dateStr = formatDate(d);
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });

      // Sleep on this day (sessions whose endTime falls on or around this day)
      const daySleep = sleepSessions.find((s) => {
        const sDate = formatDate(new Date(s.endTime || s.startTime));
        return sDate === dateStr;
      });
      const sleepHours = daySleep?.durationMinutes ? Number((daySleep.durationMinutes / 60).toFixed(1)) : 0;
      const sleepQuality = daySleep?.qualityRating || 0;

      // Steps on this day
      const dayStep = dailySteps.find((s) => s.date === dateStr);
      const steps = dayStep?.steps || 0;
      const caloriesBurned = dayStep?.caloriesBurned || 0;

      // Calories consumed on this day
      const dayFoods = foodEntries.filter((f) => f.date === dateStr);
      const caloriesConsumed = dayFoods.reduce((acc, f) => acc + f.calories, 0);
      const proteinConsumed = Math.round(dayFoods.reduce((acc, f) => acc + f.proteinG, 0));

      // Screen time on this day
      const dayScreen = screenTimeRecords.filter((st) => st.date === dateStr);
      const screenMinutes = dayScreen.reduce((acc, st) => acc + st.durationMinutes, 0);
      const productiveScreenMinutes = dayScreen
        .filter((st) => st.isProductive || st.category === "Productivity")
        .reduce((acc, st) => acc + st.durationMinutes, 0);

      // Habits on this day
      const totalPossibleHabits = habits.length;
      let completedHabitsCount = 0;
      habits.forEach((h) => {
        if (h.completions.some((c) => c.date === dateStr)) {
          completedHabitsCount++;
        }
      });
      const habitRate = totalPossibleHabits > 0 ? Math.round((completedHabitsCount / totalPossibleHabits) * 100) : 0;

      timeline.push({
        date: dateStr,
        dayLabel,
        sleepHours,
        sleepQuality,
        steps,
        caloriesBurned,
        caloriesConsumed,
        proteinConsumed,
        screenMinutes,
        screenHours: Number((screenMinutes / 60).toFixed(1)),
        productiveScreenMinutes,
        habitRate,
      });
    }

    // Aggregates & Averages
    const validSleepSessions = timeline.filter((t) => t.sleepHours > 0);
    const avgSleepHours =
      validSleepSessions.length > 0
        ? Number(
            (
              validSleepSessions.reduce((acc, t) => acc + t.sleepHours, 0) /
              validSleepSessions.length
            ).toFixed(1)
          )
        : 7.5;

    const avgSteps = Math.round(timeline.reduce((acc, t) => acc + t.steps, 0) / safeDays);
    const totalDistance = Number((timeline.reduce((acc, t) => acc + t.steps * 0.00078, 0)).toFixed(1));
    const totalCaloriesBurned = timeline.reduce((acc, t) => acc + t.caloriesBurned, 0);

    const validFoodDays = timeline.filter((t) => t.caloriesConsumed > 0);
    const avgCalories =
      validFoodDays.length > 0
        ? Math.round(validFoodDays.reduce((acc, t) => acc + t.caloriesConsumed, 0) / validFoodDays.length)
        : 2100;

    const avgScreenMinutes = Math.round(
      timeline.reduce((acc, t) => acc + t.screenMinutes, 0) / safeDays
    );

    const avgHabitRate = Math.round(
      timeline.reduce((acc, t) => acc + t.habitRate, 0) / safeDays
    );

    // Calculate LifeSync Wellness Composite Score (0 - 100)
    // 1. Sleep Score (0 - 25 pts)
    const sleepDiff = Math.abs(avgSleepHours - sleepTargetHours);
    const sleepScore = Math.max(0, Math.min(25, Math.round(25 - sleepDiff * 8)));

    // 2. Activity Score (0 - 25 pts)
    const stepRatio = Math.min(1.2, avgSteps / stepGoal);
    const activityScore = Math.max(0, Math.min(25, Math.round(stepRatio * 25)));

    // 3. Nutrition Score (0 - 20 pts)
    const calDiff = Math.abs(avgCalories - calorieGoal);
    const nutritionScore = Math.max(0, Math.min(20, Math.round(20 - (calDiff / calorieGoal) * 20)));

    // 4. Habit Score (0 - 15 pts)
    const habitScore = Math.max(0, Math.min(15, Math.round((avgHabitRate / 100) * 15)));

    // 5. Mindful Screen Time Score (0 - 15 pts)
    const screenDiff = Math.max(0, avgScreenMinutes - screenTimeLimitMinutes);
    const screenScore = Math.max(0, Math.min(15, Math.round(15 - (screenDiff / 60) * 5)));

    const compositeScore = Math.min(100, sleepScore + activityScore + nutritionScore + habitScore + screenScore);

    return NextResponse.json({
      rangeDays: safeDays,
      compositeScore,
      scoreBreakdown: {
        sleepScore: { score: sleepScore, max: 25, label: "Sleep & Circadian Rhythm" },
        activityScore: { score: activityScore, max: 25, label: "Steps & Physical Activity" },
        nutritionScore: { score: nutritionScore, max: 20, label: "Macro Balance & Caloric Target" },
        habitScore: { score: habitScore, max: 15, label: "Habit Consistency" },
        screenScore: { score: screenScore, max: 15, label: "Digital Wellbeing & Focus" },
      },
      summary: {
        avgSleepHours,
        sleepTargetHours,
        avgSteps,
        stepGoal,
        totalDistance,
        totalCaloriesBurned,
        avgCalories,
        calorieGoal,
        avgScreenMinutes,
        avgScreenHours: Number((avgScreenMinutes / 60).toFixed(1)),
        screenTimeLimitMinutes,
        avgHabitRate,
      },
      timeline,
    });
  } catch (err: unknown) {
    console.error("Analytics GET error:", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

