import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function getPastDate(daysAgo, hour = 0, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

async function main() {
  console.log("🌱 Starting LifeSync database seed...");

  // Clean existing demo user if exists
  await prisma.user.deleteMany({
    where: { email: "demo@lifesync.app" },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@lifesync.app",
      name: "Alex Morgan",
      passwordHash: passwordHash,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      profile: {
        create: {
          age: 29,
          gender: "female",
          heightCm: 172,
          weightKg: 64,
          activityLevel: "moderate",
          sleepTargetHours: 8.0,
          stepGoal: 10000,
          waterGoalMl: 2800,
          calorieGoal: 2150,
          proteinGoalG: 125,
          carbsGoalG: 230,
          fatGoalG: 60,
          screenTimeLimitMinutes: 240,
          themePreference: "dark",
        },
      },
    },
  });

  const userId = demoUser.id;
  console.log(`Created user ${demoUser.name} (${demoUser.email})`);

  // 1. Seed Sleep Sessions (Last 14 days + completed sessions with midnight handling)
  const sleepSessionsData = [
    { daysAgo: 1, startH: 23, startM: 15, endH: 7, endM: 10, quality: 5, consistency: 94, notes: "Deep, undisturbed sleep. Felt refreshed." },
    { daysAgo: 2, startH: 23, startM: 40, endH: 6, endM: 55, quality: 4, consistency: 88, notes: "Fell asleep quickly after reading." },
    { daysAgo: 3, startH: 0, startM: 20, endH: 7, endM: 45, quality: 4, consistency: 82, notes: "Weekend sleep-in." },
    { daysAgo: 4, startH: 22, startM: 50, endH: 6, endM: 30, quality: 5, consistency: 96, notes: "Great circadian alignment." },
    { daysAgo: 5, startH: 23, startM: 10, endH: 7, endM: 0, quality: 4, consistency: 90, notes: "Cool room temp helped." },
    { daysAgo: 6, startH: 23, startM: 30, endH: 6, endM: 45, quality: 3, consistency: 85, notes: "Woke up once around 3am." },
    { daysAgo: 7, startH: 22, startM: 45, endH: 7, endM: 15, quality: 5, consistency: 95, notes: "Relaxing Sunday evening routine." },
    { daysAgo: 8, startH: 23, startM: 15, endH: 7, endM: 20, quality: 4, consistency: 89, notes: "Consistent bedtime." },
    { daysAgo: 9, startH: 23, startM: 5, endH: 6, endM: 50, quality: 4, consistency: 91, notes: "Very solid energy levels." },
    { daysAgo: 10, startH: 0, startM: 10, endH: 7, endM: 30, quality: 3, consistency: 78, notes: "Late night movie." },
    { daysAgo: 11, startH: 22, startM: 55, endH: 6, endM: 40, quality: 4, consistency: 92, notes: "Optimal rest." },
    { daysAgo: 12, startH: 23, startM: 20, endH: 7, endM: 5, quality: 4, consistency: 87, notes: "Smooth sleep cycle." },
    { daysAgo: 13, startH: 23, startM: 0, endH: 7, endM: 0, quality: 5, consistency: 98, notes: "Golden 8 hours." },
    { daysAgo: 14, startH: 23, startM: 30, endH: 6, endM: 45, quality: 4, consistency: 86, notes: "Good baseline." },
  ];

  for (const s of sleepSessionsData) {
    const startTime = getPastDate(s.daysAgo, s.startH, s.startM);
    // End time is morning of daysAgo - 1 (or same day if start was 00:xx)
    const endDaysAgo = s.startH >= 20 ? s.daysAgo - 1 : s.daysAgo;
    const endTime = getPastDate(endDaysAgo, s.endH, s.endM);
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    await prisma.sleepSession.create({
      data: {
        userId,
        startTime,
        endTime,
        durationMinutes,
        qualityRating: s.quality,
        sleepConsistency: s.consistency,
        notes: s.notes,
        isCompleted: true,
      },
    });
  }

  // 2. Seed Daily Steps & Activity Records for last 14 days
  const stepProfiles = [
    { daysAgo: 0, steps: 8420, goal: 10000, dist: 6.2, cals: 380 },
    { daysAgo: 1, steps: 11340, goal: 10000, dist: 8.5, cals: 520 },
    { daysAgo: 2, steps: 10250, goal: 10000, dist: 7.8, cals: 460 },
    { daysAgo: 3, steps: 12890, goal: 10000, dist: 9.6, cals: 590 },
    { daysAgo: 4, steps: 9450, goal: 10000, dist: 7.1, cals: 420 },
    { daysAgo: 5, steps: 10800, goal: 10000, dist: 8.1, cals: 490 },
    { daysAgo: 6, steps: 7600, goal: 10000, dist: 5.7, cals: 340 },
    { daysAgo: 7, steps: 11900, goal: 10000, dist: 8.9, cals: 540 },
    { daysAgo: 8, steps: 10100, goal: 10000, dist: 7.6, cals: 450 },
    { daysAgo: 9, steps: 13400, goal: 10000, dist: 10.1, cals: 620 },
    { daysAgo: 10, steps: 9800, goal: 10000, dist: 7.4, cals: 440 },
    { daysAgo: 11, steps: 10500, goal: 10000, dist: 7.9, cals: 470 },
    { daysAgo: 12, steps: 11200, goal: 10000, dist: 8.4, cals: 510 },
    { daysAgo: 13, steps: 8900, goal: 10000, dist: 6.7, cals: 390 },
  ];

  for (const sp of stepProfiles) {
    const dStr = formatDate(getPastDate(sp.daysAgo));
    await prisma.dailyStep.create({
      data: {
        userId,
        date: dStr,
        steps: sp.steps,
        goal: sp.goal,
        distanceKm: sp.dist,
        caloriesBurned: sp.cals,
      },
    });
  }

  // Activity sessions
  const activities = [
    { daysAgo: 0, type: "Brisk Walking", dur: 35, dist: 3.2, cals: 165, steps: 4100, notes: "Morning sunshine walk in city park" },
    { daysAgo: 1, type: "Outdoor Running", dur: 45, dist: 7.0, cals: 480, steps: 7200, notes: "Paced 5k+ tempo run" },
    { daysAgo: 2, type: "Strength Training", dur: 50, dist: 0, cals: 310, steps: 1200, notes: "Upper body hypertrophy & core" },
    { daysAgo: 3, type: "Cycling", dur: 60, dist: 18.5, cals: 440, steps: 800, notes: "Scenic lakeshore loop" },
    { daysAgo: 4, type: "Vinyasa Yoga", dur: 40, dist: 0, cals: 150, steps: 400, notes: "Flexibility and mobility flow" },
    { daysAgo: 5, type: "Brisk Walking", dur: 45, dist: 4.1, cals: 210, steps: 5200, notes: "Evening recovery stroll" },
  ];

  for (const a of activities) {
    await prisma.activityRecord.create({
      data: {
        userId,
        date: formatDate(getPastDate(a.daysAgo)),
        type: a.type,
        durationMinutes: a.dur,
        distanceKm: a.dist,
        caloriesBurned: a.cals,
        steps: a.steps,
        notes: a.notes,
      },
    });
  }

  // 3. Seed Nutrition for Today & Past Days
  const todayStr = formatDate(new Date());
  const yesterdayStr = formatDate(getPastDate(1));

  const foodItems = [
    { date: todayStr, meal: "breakfast", name: "Avocado & Poached Eggs on Sourdough", cals: 420, p: 22, c: 38, f: 20, fib: 7, serving: "2 slices toast + 2 eggs" },
    { date: todayStr, meal: "breakfast", name: "Greek Yogurt with Berries & Honey", cals: 210, p: 18, c: 26, f: 3, fib: 4, serving: "1 bowl (200g)" },
    { date: todayStr, meal: "lunch", name: "Mediterranean Quinoa Bowl with Grilled Chicken", cals: 580, p: 44, c: 54, f: 18, fib: 9, serving: "1 large bowl" },
    { date: todayStr, meal: "snack", name: "Raw Almonds & Green Apple", cals: 190, p: 5, c: 22, f: 11, fib: 5, serving: "1 handful + 1 apple" },
    { date: todayStr, meal: "dinner", name: "Pan-Seared Salmon with Asparagus & Sweet Potato", cals: 620, p: 42, c: 45, f: 24, fib: 8, serving: "200g salmon fillet" },

    { date: yesterdayStr, meal: "breakfast", name: "Oatmeal with Chia Seeds & Blueberries", cals: 360, p: 14, c: 58, f: 8, fib: 11, serving: "1 cup oats cooked" },
    { date: yesterdayStr, meal: "lunch", name: "Grilled Salmon Poke Bowl with Edamame", cals: 640, p: 40, c: 68, f: 20, fib: 7, serving: "1 bowl" },
    { date: yesterdayStr, meal: "dinner", name: "Turkey Breast Stir-Fry with Brown Rice", cals: 590, p: 48, c: 62, f: 14, fib: 6, serving: "1 plate" },
    { date: yesterdayStr, meal: "snack", name: "Whey Protein Shake & Banana", cals: 240, p: 26, c: 30, f: 2, fib: 3, serving: "1 scoop in almond milk" },
  ];

  for (const f of foodItems) {
    await prisma.foodEntry.create({
      data: {
        userId,
        date: f.date,
        mealType: f.meal,
        foodName: f.name,
        calories: f.cals,
        proteinG: f.p,
        carbsG: f.c,
        fatG: f.f,
        fiberG: f.fib,
        servingSize: f.serving,
      },
    });
  }

  // Water logs for today (total 2250 ml logged so far towards 2800 goal)
  const waterEntries = [
    { amount: 500 }, // morning hydration
    { amount: 350 }, // with breakfast
    { amount: 500 }, // mid-morning
    { amount: 400 }, // with lunch
    { amount: 500 }, // afternoon
  ];

  for (const w of waterEntries) {
    await prisma.waterLog.create({
      data: {
        userId,
        date: todayStr,
        amountMl: w.amount,
      },
    });
  }

  // 4. Screen Time Records for Today
  const screenTime = [
    { cat: "Productivity", app: "VS Code & Development Tools", dur: 140, isProd: true },
    { cat: "Productivity", app: "Notion & Research Docs", dur: 45, isProd: true },
    { cat: "Social", app: "Slack & Messaging", dur: 35, isProd: false },
    { cat: "Entertainment", app: "YouTube & Podcasts", dur: 30, isProd: false },
    { cat: "Utility", app: "Email & Calendar", dur: 25, isProd: true },
  ];

  for (const st of screenTime) {
    await prisma.screenTimeRecord.create({
      data: {
        userId,
        date: todayStr,
        category: st.cat,
        appName: st.app,
        durationMinutes: st.dur,
        isProductive: st.isProd,
      },
    });
  }

  // Focus sessions
  await prisma.focusSession.createMany({
    data: [
      { userId, durationMinutes: 50, tag: "Deep Work - Coding", completed: true },
      { userId, durationMinutes: 25, tag: "Mindful Reading", completed: true },
      { userId, durationMinutes: 30, tag: "Project Architecture", completed: true },
    ],
  });

  // 5. Habits & Completions
  const habitTemplates = [
    { title: "Wake up by 7:00 AM", cat: "wellness", days: 7, color: "#F59E0B", icon: "Sun", reminder: "07:00" },
    { title: "Drink 500ml water upon waking", cat: "wellness", days: 7, color: "#06B6D4", icon: "Droplets", reminder: "07:15" },
    { title: "Hit 10,000 daily steps", cat: "fitness", days: 7, color: "#10B981", icon: "Footprints", reminder: "18:00" },
    { title: "No screens 45m before bed", cat: "mindfulness", days: 7, color: "#8B5CF6", icon: "Moon", reminder: "22:15" },
    { title: "Read 20 pages of a book", cat: "productivity", days: 6, color: "#3B82F6", icon: "BookOpen", reminder: "21:00" },
    { title: "Daily gratitude journaling", cat: "mindfulness", days: 7, color: "#EC4899", icon: "Heart", reminder: "22:00" },
  ];

  for (const h of habitTemplates) {
    const habit = await prisma.habit.create({
      data: {
        userId,
        title: h.title,
        category: h.cat,
        targetDaysPerWeek: h.days,
        color: h.color,
        icon: h.icon,
        reminderTime: h.reminder,
      },
    });

    // Seed habit completions for past 10 days (with high consistency ~80-90%)
    for (let dayOffset = 0; dayOffset <= 9; dayOffset++) {
      // simulate realistic completion pattern
      const shouldComplete = (dayOffset % 7 !== 4) && Math.random() > 0.15;
      if (shouldComplete) {
        await prisma.habitCompletion.create({
          data: {
            habitId: habit.id,
            userId,
            date: formatDate(getPastDate(dayOffset)),
            completed: true,
          },
        });
      }
    }
  }

  // 6. Notifications
  await prisma.notification.createMany({
    data: [
      { userId, title: "Great Sleep Consistency! 🌙", message: "You achieved a 94% sleep consistency score over the last 7 days.", type: "success", isRead: false },
      { userId, title: "Hydration Milestone 💧", message: "You are only 550ml away from your 2,800ml daily hydration goal.", type: "info", isRead: false },
      { userId, title: "Focus Shield Activated 🧘", message: "Your 50-minute deep work focus block was successfully completed.", type: "success", isRead: true },
      { userId, title: "Evening Bedtime Approaching", message: "Your target bedtime is 11:15 PM to reach your 8h rest target.", type: "reminder", isRead: true },
    ],
  });

  console.log("✅ Seed completed successfully! Demo user ready: demo@lifesync.app / password123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

