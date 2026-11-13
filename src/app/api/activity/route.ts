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
    const date = searchParams.get("date");

    const activities = await prisma.activityRecord.findMany({
      where: {
        userId: user.id,
        ...(date ? { date } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ activities });
  } catch (err: unknown) {
    console.error("Activity GET error:", err);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
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
    const type = body.type || "Workout";
    const durationMinutes = Number(body.durationMinutes || 30);
    const distanceKm = Number(body.distanceKm || 0);
    const caloriesBurned = Number(body.caloriesBurned || Math.round(durationMinutes * 6.5));
    const steps = Number(body.steps || 0);
    const notes = body.notes || "";

    const activity = await prisma.activityRecord.create({
      data: {
        userId: user.id,
        date,
        type,
        durationMinutes,
        distanceKm,
        caloriesBurned,
        steps,
        notes,
      },
    });

    // If activity includes steps, also add to DailyStep record
    if (steps > 0) {
      const existingStep = await prisma.dailyStep.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date,
          },
        },
      });

      const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
      const currentGoal = profile?.stepGoal || 10000;

      const newSteps = (existingStep?.steps || 0) + steps;
      const newDist = Number((newSteps * 0.00078).toFixed(2));
      const newCals = Math.round(newSteps * 0.045);

      await prisma.dailyStep.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date,
          },
        },
        create: {
          userId: user.id,
          date,
          steps: newSteps,
          goal: currentGoal,
          distanceKm: newDist,
          caloriesBurned: newCals,
        },
        update: {
          steps: newSteps,
          distanceKm: newDist,
          caloriesBurned: newCals,
        },
      });
    }

    return NextResponse.json({ success: true, activity });
  } catch (err: unknown) {
    console.error("Activity POST error:", err);
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
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
      return NextResponse.json({ error: "Activity ID required" }, { status: 400 });
    }

    await prisma.activityRecord.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Activity deleted" });
  } catch (err: unknown) {
    console.error("Activity DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}

