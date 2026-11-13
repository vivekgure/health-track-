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

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || getTodayString();

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    const goalMl = profile?.waterGoalMl || 2500;

    const logs = await prisma.waterLog.findMany({
      where: {
        userId: user.id,
        date,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0);

    return NextResponse.json({
      date,
      totalMl,
      goalMl,
      percentage: Math.min(100, Math.round((totalMl / goalMl) * 100)),
      logs,
    });
  } catch (err: unknown) {
    console.error("Water GET error:", err);
    return NextResponse.json({ error: "Failed to fetch water data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const date = body.date || getTodayString();
    const amountMl = Number(body.amountMl || 250);

    if (amountMl <= 0) {
      return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
    }

    const log = await prisma.waterLog.create({
      data: {
        userId: user.id,
        date,
        amountMl,
      },
    });

    // Check if goal hit
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    const goalMl = profile?.waterGoalMl || 2500;

    const allTodayLogs = await prisma.waterLog.findMany({
      where: { userId: user.id, date },
    });
    const newTotal = allTodayLogs.reduce((sum, l) => sum + l.amountMl, 0);

    if (newTotal >= goalMl && newTotal - amountMl < goalMl) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Hydration Goal Completed! 💧",
          message: `Awesome work staying hydrated! You reached your daily goal of ${goalMl}ml.`,
          type: "success",
        },
      });
    }

    return NextResponse.json({ success: true, log, newTotal });
  } catch (err: unknown) {
    console.error("Water POST error:", err);
    return NextResponse.json({ error: "Failed to log water" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || getTodayString();

    // Undo last water log
    const lastLog = await prisma.waterLog.findFirst({
      where: {
        userId: user.id,
        date,
      },
      orderBy: { createdAt: "desc" },
    });

    if (lastLog) {
      await prisma.waterLog.delete({ where: { id: lastLog.id } });
    }

    return NextResponse.json({ success: true, message: "Last water log removed" });
  } catch (err: unknown) {
    console.error("Water DELETE error:", err);
    return NextResponse.json({ error: "Failed to remove water log" }, { status: 500 });
  }
}

