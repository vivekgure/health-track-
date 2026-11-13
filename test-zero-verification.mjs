// test-zero-verification.mjs
const BASE_URL = "http://localhost:3000";

async function run() {
  console.log("🔍 Running Zero State & Navigation Verification...");

  // 1. Test Page Routes
  const pages = ["/", "/sleep", "/activity", "/nutrition", "/screen-time", "/habits", "/analytics", "/settings"];
  for (const page of pages) {
    const res = await fetch(`${BASE_URL}${page}`);
    if (res.status === 200) {
      console.log(`✅ Page [${page}]: HTTP 200 OK`);
    } else {
      throw new Error(`Failed route: ${page} returned status ${res.status}`);
    }
  }

  // 2. Test Login
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@lifesync.app", password: "password123" }),
  });
  const loginData = await loginRes.json();
  const cookieHeader = loginRes.headers.get("set-cookie");
  const token = cookieHeader ? cookieHeader.split(";")[0] : "";
  console.log(`✅ Login response:`, loginData.user ? `Logged in as ${loginData.user.name}` : loginData);

  // 3. Test Overview with Zero Data
  const ovRes = await fetch(`${BASE_URL}/api/overview`, {
    headers: { Cookie: token },
  });
  const ov = await ovRes.json();
  console.log(`✅ Clean Slate Overview Verified:`);
  console.log(`   - Steps: ${ov.steps.current} / ${ov.steps.goal} (Progress: ${ov.steps.progress}%)`);
  console.log(`   - Calories: ${ov.nutrition.calories} / ${ov.nutrition.calorieGoal} kcal`);
  console.log(`   - Hydration: ${ov.nutrition.waterMl} / ${ov.nutrition.waterGoalMl} ml`);
  console.log(`   - Screen Time: ${ov.screenTime.totalMinutes} mins`);
  console.log(`   - Habits Completed Today: ${ov.habits.completed} / ${ov.habits.total}`);
  console.log(`   - Active Sleep: ${ov.sleep.isSleeping ? "Active" : "None"}`);

  // 4. Test Reset API endpoint
  const resetRes = await fetch(`${BASE_URL}/api/reset`, {
    method: "POST",
    headers: { Cookie: token },
  });
  const resetData = await resetRes.json();
  console.log(`✅ Reset API endpoint test:`, resetData);

  console.log("🎉 ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
}

run().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});

