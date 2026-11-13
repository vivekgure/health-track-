import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetToZero() {
  console.log("🕷️ Resetting LifeSync application data to zero...");

  // 1. Delete all transactional tracking logs
  await prisma.sleepSession.deleteMany({});
  await prisma.activityRecord.deleteMany({});
  await prisma.dailyStep.deleteMany({});
  await prisma.foodEntry.deleteMany({});
  await prisma.waterLog.deleteMany({});
  await prisma.screenTimeRecord.deleteMany({});
  await prisma.focusSession.deleteMany({});
  await prisma.habitCompletion.deleteMany({});
  await prisma.habit.deleteMany({});
  await prisma.notification.deleteMany({});

  console.log("🧹 Cleaned all activity, sleep, nutrition, screen time, and habit completions.");

  // 2. Ensure demo user exists with clean zero profile
  let user = await prisma.user.findUnique({
    where: { email: "demo@lifesync.app" },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "demo@lifesync.app",
        name: "Alex Morgan",
        passwordHash,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      },
    });
  }

  // Upsert profile with clean defaults
  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      age: 28,
      gender: "not_specified",
      heightCm: 175,
      weightKg: 70,
      activityLevel: "moderate",
      sleepTargetHours: 8.0,
      stepGoal: 10000,
      waterGoalMl: 2500,
      calorieGoal: 2000,
      proteinGoalG: 120,
      carbsGoalG: 220,
      fatGoalG: 60,
      screenTimeLimitMinutes: 240,
      themePreference: "dark",
    },
    update: {
      age: 28,
      gender: "not_specified",
      heightCm: 175,
      weightKg: 70,
      activityLevel: "moderate",
      sleepTargetHours: 8.0,
      stepGoal: 10000,
      waterGoalMl: 2500,
      calorieGoal: 2000,
      proteinGoalG: 120,
      carbsGoalG: 220,
      fatGoalG: 60,
      screenTimeLimitMinutes: 240,
      themePreference: "dark",
    },
  });

  // 3. Create fresh starter habits (with 0 completions, uncompleted for today)
  const starterHabits = [
    { title: "Morning Sunlight & Hydration", category: "wellness", color: "#FF2638", icon: "Sun", targetDaysPerWeek: 7 },
    { title: "Walk 10,000 Steps", category: "fitness", color: "#FF2638", icon: "Activity", targetDaysPerWeek: 7 },
    { title: "Balanced Whole-Food Meals", category: "wellness", color: "#FF2638", icon: "Utensils", targetDaysPerWeek: 7 },
    { title: "Deep Work Focus Session", category: "productivity", color: "#FF2638", icon: "Zap", targetDaysPerWeek: 5 },
    { title: "Sleep Protocol (8 Hours Rest)", category: "wellness", color: "#FF2638", icon: "Moon", targetDaysPerWeek: 7 },
  ];

  for (const h of starterHabits) {
    await prisma.habit.create({
      data: {
        userId: user.id,
        ...h,
      },
    });
  }

  // 4. Create fresh welcome notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "LifeSync Reset Complete",
      message: "All metrics have been reset to zero. Your fresh wellness tracking journey starts right now!",
      type: "system",
      isRead: false,
    },
  });

  console.log("✅ Reset to zero complete! Fresh state initialized for Alex Morgan (demo@lifesync.app).");
}

resetToZero()
  .catch((e) => {
    console.error("Error resetting to zero:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
