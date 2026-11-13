import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({ user, profile });
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Update User name if provided
    if (body.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: body.name },
      });
    }

    // Update Profile fields
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        age: body.age !== undefined ? Number(body.age) : 28,
        gender: body.gender || "not_specified",
        heightCm: body.heightCm !== undefined ? Number(body.heightCm) : 175,
        weightKg: body.weightKg !== undefined ? Number(body.weightKg) : 70,
        activityLevel: body.activityLevel || "moderate",
        sleepTargetHours: body.sleepTargetHours !== undefined ? Number(body.sleepTargetHours) : 8.0,
        stepGoal: body.stepGoal !== undefined ? Number(body.stepGoal) : 10000,
        waterGoalMl: body.waterGoalMl !== undefined ? Number(body.waterGoalMl) : 2500,
        calorieGoal: body.calorieGoal !== undefined ? Number(body.calorieGoal) : 2200,
        proteinGoalG: body.proteinGoalG !== undefined ? Number(body.proteinGoalG) : 120,
        carbsGoalG: body.carbsGoalG !== undefined ? Number(body.carbsGoalG) : 250,
        fatGoalG: body.fatGoalG !== undefined ? Number(body.fatGoalG) : 65,
        screenTimeLimitMinutes: body.screenTimeLimitMinutes !== undefined ? Number(body.screenTimeLimitMinutes) : 240,
        themePreference: body.themePreference || "dark",
      },
      update: {
        ...(body.age !== undefined && { age: Number(body.age) }),
        ...(body.gender !== undefined && { gender: body.gender }),
        ...(body.heightCm !== undefined && { heightCm: Number(body.heightCm) }),
        ...(body.weightKg !== undefined && { weightKg: Number(body.weightKg) }),
        ...(body.activityLevel !== undefined && { activityLevel: body.activityLevel }),
        ...(body.sleepTargetHours !== undefined && { sleepTargetHours: Number(body.sleepTargetHours) }),
        ...(body.stepGoal !== undefined && { stepGoal: Number(body.stepGoal) }),
        ...(body.waterGoalMl !== undefined && { waterGoalMl: Number(body.waterGoalMl) }),
        ...(body.calorieGoal !== undefined && { calorieGoal: Number(body.calorieGoal) }),
        ...(body.proteinGoalG !== undefined && { proteinGoalG: Number(body.proteinGoalG) }),
        ...(body.carbsGoalG !== undefined && { carbsGoalG: Number(body.carbsGoalG) }),
        ...(body.fatGoalG !== undefined && { fatGoalG: Number(body.fatGoalG) }),
        ...(body.screenTimeLimitMinutes !== undefined && { screenTimeLimitMinutes: Number(body.screenTimeLimitMinutes) }),
        ...(body.themePreference !== undefined && { themePreference: body.themePreference }),
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: unknown) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

