import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      profile,
      sleepSessions,
      dailySteps,
      activityRecords,
      foodEntries,
      waterLogs,
      screenTimeRecords,
      focusSessions,
      habits,
    ] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: user.id } }),
      prisma.sleepSession.findMany({ where: { userId: user.id } }),
      prisma.dailyStep.findMany({ where: { userId: user.id } }),
      prisma.activityRecord.findMany({ where: { userId: user.id } }),
      prisma.foodEntry.findMany({ where: { userId: user.id } }),
      prisma.waterLog.findMany({ where: { userId: user.id } }),
      prisma.screenTimeRecord.findMany({ where: { userId: user.id } }),
      prisma.focusSession.findMany({ where: { userId: user.id } }),
      prisma.habit.findMany({
        where: { userId: user.id },
        include: { completions: true },
      }),
    ]);

    const exportData = {
      exportMetadata: {
        appName: "LifeSync",
        exportedAt: new Date().toISOString(),
        userEmail: user.email,
        userName: user.name,
      },
      profile,
      sleepSessions,
      dailySteps,
      activityRecords,
      foodEntries,
      waterLogs,
      screenTimeRecords,
      focusSessions,
      habits,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="lifesync-export-${user.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err: unknown) {
    console.error("Export GET error:", err);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}

