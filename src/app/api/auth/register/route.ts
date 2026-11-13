import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and initial profile
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        profile: {
          create: {
            age: 28,
            gender: "not_specified",
            heightCm: 175,
            weightKg: 70,
            activityLevel: "moderate",
            sleepTargetHours: 8.0,
            stepGoal: 10000,
            waterGoalMl: 2500,
            calorieGoal: 2200,
            proteinGoalG: 120,
            carbsGoalG: 250,
            fatGoalG: 65,
            screenTimeLimitMinutes: 240,
            themePreference: "dark",
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Create default habits
    await prisma.habit.createMany({
      data: [
        { userId: user.id, title: "Morning hydration (500ml)", category: "wellness", targetDaysPerWeek: 7, color: "#06B6D4", icon: "Droplets", reminderTime: "07:30" },
        { userId: user.id, title: "Hit 10,000 steps", category: "fitness", targetDaysPerWeek: 7, color: "#10B981", icon: "Footprints", reminderTime: "18:00" },
        { userId: user.id, title: "Deep Work Focus Block (50 min)", category: "productivity", targetDaysPerWeek: 5, color: "#6366F1", icon: "Brain", reminderTime: "10:00" },
        { userId: user.id, title: "Wind-down screen curfew", category: "mindfulness", targetDaysPerWeek: 7, color: "#8B5CF6", icon: "Moon", reminderTime: "22:30" },
      ],
    });

    // Create welcoming notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to LifeSync! ✨",
        message: "Your holistic wellness and productivity journey starts today. Check out your dashboard to get started.",
        type: "success",
      },
    });

    const token = await createSessionToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
      },
    });

    // Set secure cookie
    response.cookies.set("lifesync_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}

