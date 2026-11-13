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
    const limitMinutes = profile?.screenTimeLimitMinutes || 240;

    const records = await prisma.screenTimeRecord.findMany({
      where: {
        userId: user.id,
        date,
      },
      orderBy: { durationMinutes: "desc" },
    });

    // Total minutes
    const totalMinutes = records.reduce((acc, r) => acc + r.durationMinutes, 0);

    // Group by category
    const categoryMap: { [cat: string]: number } = {
      Productivity: 0,
      Social: 0,
      Entertainment: 0,
      Utility: 0,
      Health: 0,
    };

    let productiveMinutes = 0;
    records.forEach((r) => {
      const cat = r.category || "Utility";
      categoryMap[cat] = (categoryMap[cat] || 0) + r.durationMinutes;
      if (r.isProductive || cat === "Productivity") {
        productiveMinutes += r.durationMinutes;
      }
    });

    const categoryList = Object.entries(categoryMap).map(([category, minutes]) => ({
      category,
      minutes,
      percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
    }));

    return NextResponse.json({
      date,
      totalMinutes,
      totalHours: Number((totalMinutes / 60).toFixed(1)),
      limitMinutes,
      limitHours: Number((limitMinutes / 60).toFixed(1)),
      percentOfLimit: Math.min(100, Math.round((totalMinutes / limitMinutes) * 100)),
      productiveMinutes,
      productivityRatio: totalMinutes > 0 ? Math.round((productiveMinutes / totalMinutes) * 100) : 100,
      categories: categoryList,
      records,
    });
  } catch (err: unknown) {
    console.error("ScreenTime GET error:", err);
    return NextResponse.json({ error: "Failed to fetch screen time data" }, { status: 500 });
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
    const category = body.category || "Productivity";
    const appName = body.appName?.trim() || "Web Browsing";
    const durationMinutes = Number(body.durationMinutes || 15);
    const isProductive = body.isProductive !== undefined ? Boolean(body.isProductive) : category === "Productivity";

    if (durationMinutes <= 0) {
      return NextResponse.json({ error: "Duration must be positive" }, { status: 400 });
    }

    const record = await prisma.screenTimeRecord.create({
      data: {
        userId: user.id,
        date,
        category,
        appName,
        durationMinutes,
        isProductive,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (err: unknown) {
    console.error("ScreenTime POST error:", err);
    return NextResponse.json({ error: "Failed to log screen time" }, { status: 500 });
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
      return NextResponse.json({ error: "Record ID required" }, { status: 400 });
    }

    await prisma.screenTimeRecord.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Screen time record deleted" });
  } catch (err: unknown) {
    console.error("ScreenTime DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}

