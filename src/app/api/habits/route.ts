import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function getPastDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return formatDate(d);
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayStr = formatDate(new Date());

    // Fetch user's active habits
    const habits = await prisma.habit.findMany({
      where: {
        userId: user.id,
        archived: false,
      },
      include: {
        completions: {
          where: {
            date: {
              gte: getPastDate(30), // past 30 days
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Compute streaks and completion matrices
    const habitsWithMetrics = habits.map((habit) => {
      const completionMap = new Set(habit.completions.map((c) => c.date));
      const completedToday = completionMap.has(todayStr);

      // Calculate current streak
      let currentStreak = 0;
      let checkOffset = completedToday ? 0 : 1;

      while (true) {
        const checkDate = getPastDate(checkOffset);
        if (completionMap.has(checkDate)) {
          currentStreak++;
          checkOffset++;
        } else {
          break;
        }
      }

      // Past 7 days status array
      const last7Days = [];
      let past7CompletedCount = 0;
      for (let i = 6; i >= 0; i--) {
        const dStr = getPastDate(i);
        const done = completionMap.has(dStr);
        if (done) past7CompletedCount++;
        last7Days.push({
          date: dStr,
          completed: done,
        });
      }

      const completionRate7d = Math.round((past7CompletedCount / 7) * 100);

      return {
        id: habit.id,
        title: habit.title,
        description: habit.description,
        category: habit.category,
        targetDaysPerWeek: habit.targetDaysPerWeek,
        color: habit.color,
        icon: habit.icon,
        reminderTime: habit.reminderTime,
        completedToday,
        currentStreak,
        completionRate7d,
        last7Days,
        totalCompletions: habit.completions.length,
      };
    });

    const totalHabits = habitsWithMetrics.length;
    const completedTodayCount = habitsWithMetrics.filter((h) => h.completedToday).length;
    const completionPercentageToday =
      totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;

    return NextResponse.json({
      todayStr,
      habits: habitsWithMetrics,
      stats: {
        totalHabits,
        completedTodayCount,
        completionPercentageToday,
      },
    });
  } catch (err: unknown) {
    console.error("Habits GET error:", err);
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        title,
        description: body.description || "",
        category: body.category || "wellness",
        targetDaysPerWeek: Number(body.targetDaysPerWeek || 7),
        color: body.color || "#10B981",
        icon: body.icon || "CheckCircle",
        reminderTime: body.reminderTime || null,
      },
    });

    return NextResponse.json({ success: true, habit });
  } catch (err: unknown) {
    console.error("Habits POST error:", err);
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const habitId = body.habitId;
    const date = body.date || formatDate(new Date());

    if (!habitId) {
      return NextResponse.json({ error: "habitId is required" }, { status: 400 });
    }

    // Check if habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: user.id },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Check existing completion for that date
    const existing = await prisma.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId,
          date,
        },
      },
    });

    let completed = false;
    if (existing) {
      // Toggle off -> Delete completion
      await prisma.habitCompletion.delete({
        where: { id: existing.id },
      });
      completed = false;
    } else {
      // Toggle on -> Create completion
      await prisma.habitCompletion.create({
        data: {
          habitId,
          userId: user.id,
          date,
          completed: true,
        },
      });
      completed = true;
    }

    return NextResponse.json({
      success: true,
      habitId,
      date,
      completed,
    });
  } catch (err: unknown) {
    console.error("Habits PUT toggle error:", err);
    return NextResponse.json({ error: "Failed to toggle habit" }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ error: "Habit ID required" }, { status: 400 });
    }

    await prisma.habit.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Habit deleted" });
  } catch (err: unknown) {
    console.error("Habits DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 });
  }
}

