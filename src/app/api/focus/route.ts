import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.focusSession.findMany({
      where: { userId: user.id },
      orderBy: { startTime: "desc" },
      take: 20,
    });

    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    return NextResponse.json({
      sessions,
      totalMinutes,
      completedCount: sessions.filter((s) => s.completed).length,
    });
  } catch (err: unknown) {
    console.error("Focus GET error:", err);
    return NextResponse.json({ error: "Failed to fetch focus sessions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const durationMinutes = Number(body.durationMinutes || 25);
    const tag = body.tag || "Deep Work";
    const notes = body.notes || "";
    const completed = body.completed !== undefined ? Boolean(body.completed) : true;

    const session = await prisma.focusSession.create({
      data: {
        userId: user.id,
        durationMinutes,
        tag,
        completed,
        notes,
      },
    });

    // Also record as productive screen time entry for today
    const today = new Date().toISOString().split("T")[0];
    await prisma.screenTimeRecord.create({
      data: {
        userId: user.id,
        date: today,
        category: "Productivity",
        appName: `Focus Mode: ${tag}`,
        durationMinutes,
        isProductive: true,
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (err: unknown) {
    console.error("Focus POST error:", err);
    return NextResponse.json({ error: "Failed to record focus session" }, { status: 500 });
  }
}

