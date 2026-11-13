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

    const entries = await prisma.foodEntry.findMany({
      where: {
        userId: user.id,
        date,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by meal type
    const meals = {
      breakfast: entries.filter((e) => e.mealType === "breakfast"),
      lunch: entries.filter((e) => e.mealType === "lunch"),
      dinner: entries.filter((e) => e.mealType === "dinner"),
      snack: entries.filter((e) => e.mealType === "snack"),
    };

    // Calculate totals
    const totals = entries.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.proteinG,
        carbs: acc.carbs + item.carbsG,
        fat: acc.fat + item.fatG,
        fiber: acc.fiber + item.fiberG,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const goals = {
      calories: profile?.calorieGoal || 2200,
      protein: profile?.proteinGoalG || 120,
      carbs: profile?.carbsGoalG || 250,
      fat: profile?.fatGoalG || 65,
      fiber: 30, // standard clinical guideline
    };

    // Generate insights
    const insights: string[] = [];
    if (totals.calories > 0) {
      const calRatio = totals.calories / goals.calories;
      if (calRatio >= 0.85 && calRatio <= 1.1) {
        insights.push("Caloric intake is directly on target for your metabolic baseline.");
      } else if (calRatio > 1.1) {
        insights.push("You're above your daily calorie target. Focus on lighter foods or an evening walk.");
      } else {
        insights.push(`You have ${(goals.calories - totals.calories).toLocaleString()} kcal remaining for today.`);
      }

      if (totals.protein >= goals.protein) {
        insights.push("Protein target achieved! Excellent for muscle preservation & satiety.");
      } else {
        insights.push(`${Math.round(goals.protein - totals.protein)}g more protein needed to hit your daily goal.`);
      }

      if (totals.fiber >= 25) {
        insights.push("High fiber intake detected — great for gut microbiome & digestion.");
      }
    } else {
      insights.push("No meals logged yet today. Track your breakfast to kickstart your daily macros!");
    }

    return NextResponse.json({
      date,
      entries,
      meals,
      totals: {
        calories: Math.round(totals.calories),
        protein: Number(totals.protein.toFixed(1)),
        carbs: Number(totals.carbs.toFixed(1)),
        fat: Number(totals.fat.toFixed(1)),
        fiber: Number(totals.fiber.toFixed(1)),
      },
      goals,
      insights,
    });
  } catch (err: unknown) {
    console.error("Nutrition GET error:", err);
    return NextResponse.json({ error: "Failed to fetch nutrition data" }, { status: 500 });
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
    const mealType = body.mealType || "snack";
    const foodName = body.foodName?.trim();
    const calories = Number(body.calories || 0);
    const proteinG = Number(body.proteinG || 0);
    const carbsG = Number(body.carbsG || 0);
    const fatG = Number(body.fatG || 0);
    const fiberG = Number(body.fiberG || 0);
    const servingSize = body.servingSize || "1 serving";
    const notes = body.notes || "";

    if (!foodName || calories < 0) {
      return NextResponse.json(
        { error: "Valid food name and calories are required" },
        { status: 400 }
      );
    }

    const entry = await prisma.foodEntry.create({
      data: {
        userId: user.id,
        date,
        mealType,
        foodName,
        calories,
        proteinG,
        carbsG,
        fatG,
        fiberG,
        servingSize,
        notes,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (err: unknown) {
    console.error("Nutrition POST error:", err);
    return NextResponse.json({ error: "Failed to add food entry" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // 1. Update Daily Calorie & Macro Goals
    if (body.action === "updateGoal") {
      const calorieGoal = Number(body.calorieGoal);
      if (!calorieGoal || calorieGoal < 500) {
        return NextResponse.json({ error: "Valid calorie target (min 500 kcal) required" }, { status: 400 });
      }

      const updateData: {
        calorieGoal: number;
        proteinGoalG?: number;
        carbsGoalG?: number;
        fatGoalG?: number;
      } = { calorieGoal };

      if (body.proteinGoalG !== undefined) updateData.proteinGoalG = Number(body.proteinGoalG);
      if (body.carbsGoalG !== undefined) updateData.carbsGoalG = Number(body.carbsGoalG);
      if (body.fatGoalG !== undefined) updateData.fatGoalG = Number(body.fatGoalG);

      const profile = await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          ...updateData,
        },
        update: updateData,
      });

      return NextResponse.json({ success: true, message: "Calorie target updated", profile });
    }

    // 2. Update Specific Logged Food Entry
    if (body.id) {
      const existing = await prisma.foodEntry.findFirst({
        where: { id: body.id, userId: user.id },
      });

      if (!existing) {
        return NextResponse.json({ error: "Food entry not found" }, { status: 404 });
      }

      const updated = await prisma.foodEntry.update({
        where: { id: body.id },
        data: {
          foodName: body.foodName ? body.foodName.trim() : existing.foodName,
          calories: body.calories !== undefined ? Number(body.calories) : existing.calories,
          proteinG: body.proteinG !== undefined ? Number(body.proteinG) : existing.proteinG,
          carbsG: body.carbsG !== undefined ? Number(body.carbsG) : existing.carbsG,
          fatG: body.fatG !== undefined ? Number(body.fatG) : existing.fatG,
          fiberG: body.fiberG !== undefined ? Number(body.fiberG) : existing.fiberG,
          servingSize: body.servingSize || existing.servingSize,
          mealType: body.mealType || existing.mealType,
          notes: body.notes !== undefined ? body.notes : existing.notes,
        },
      });

      return NextResponse.json({ success: true, message: "Food entry updated", entry: updated });
    }

    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Nutrition PUT error:", err);
    return NextResponse.json({ error: "Failed to update nutrition data" }, { status: 500 });
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
      return NextResponse.json({ error: "Entry ID required" }, { status: 400 });
    }

    await prisma.foodEntry.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Food entry deleted" });
  } catch (err: unknown) {
    console.error("Nutrition DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete food entry" }, { status: 500 });
  }
}

