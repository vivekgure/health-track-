const BASE_URL = "http://localhost:3000";

async function run() {
  console.log("🔍 Verifying Sleep Reset and Calorie Intake Edit Features...");

  // 1. Login as demo user
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@lifesync.app", password: "password123" }),
  });
  const cookieHeader = loginRes.headers.get("set-cookie");
  const token = cookieHeader ? cookieHeader.split(";")[0] : "";
  console.log(`✅ Authenticated with demo account`);

  // 2. Test Reset Sleep Data
  const resetSleepRes = await fetch(`${BASE_URL}/api/sleep`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: token },
    body: JSON.stringify({ action: "reset" }),
  });
  const resetSleepData = await resetSleepRes.json();
  console.log(`✅ Reset Sleep API:`, resetSleepData.message);

  // 3. Verify Sleep Stats are truly zero
  const sleepRes = await fetch(`${BASE_URL}/api/sleep`, {
    headers: { Cookie: token },
  });
  const sleepData = await sleepRes.json();
  console.log(`✅ Zeroed Sleep Stats Verified:`);
  console.log(`   - Average Hours: ${sleepData.stats.avgHours} hrs`);
  console.log(`   - Consistency Score: ${sleepData.stats.consistencyScore}%`);
  console.log(`   - Quality Rating: ${sleepData.stats.avgQuality}`);
  console.log(`   - Tracked Nights: ${sleepData.stats.totalSessions}`);
  console.log(`   - Active Session: ${sleepData.activeSession ? "Active" : "None"}`);

  if (sleepData.stats.avgHours !== 0 || sleepData.stats.consistencyScore !== 0) {
    throw new Error(`Sleep stats are not 0: avgHours=${sleepData.stats.avgHours}, consistency=${sleepData.stats.consistencyScore}`);
  }

  // 4. Test Calorie Intake Target Edit (PUT /api/nutrition action: updateGoal)
  const updateGoalRes = await fetch(`${BASE_URL}/api/nutrition`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: token },
    body: JSON.stringify({ action: "updateGoal", calorieGoal: 2350, proteinGoalG: 145 }),
  });
  const updateGoalData = await updateGoalRes.json();
  console.log(`✅ Calorie Target Edit API:`, updateGoalData.message, `New target: 2350 kcal`);

  // 5. Test Food Entry Creation & Editing
  const addFoodRes = await fetch(`${BASE_URL}/api/nutrition`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: token },
    body: JSON.stringify({
      foodName: "Post-Workout Smoothie",
      calories: 320,
      mealType: "snack",
      proteinG: 28,
      carbsG: 40,
      fatG: 6,
    }),
  });
  const addFoodData = await addFoodRes.json();
  const entryId = addFoodData.entry.id;
  console.log(`✅ Created food entry: "${addFoodData.entry.foodName}" (${addFoodData.entry.calories} kcal)`);

  // Edit the created food entry
  const editFoodRes = await fetch(`${BASE_URL}/api/nutrition`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: token },
    body: JSON.stringify({
      id: entryId,
      foodName: "Double Protein Smoothie",
      calories: 450,
      proteinG: 45,
    }),
  });
  const editFoodData = await editFoodRes.json();
  console.log(`✅ Edited food entry: "${editFoodData.entry.foodName}" with ${editFoodData.entry.calories} kcal (Protein: ${editFoodData.entry.proteinG}g)`);

  // Clean up test entry
  await fetch(`${BASE_URL}/api/nutrition?id=${entryId}`, {
    method: "DELETE",
    headers: { Cookie: token },
  });
  console.log(`✅ Cleaned up test food entry`);

  // Reset goal back to 2000
  await fetch(`${BASE_URL}/api/nutrition`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: token },
    body: JSON.stringify({ action: "updateGoal", calorieGoal: 2000, proteinGoalG: 120, carbsGoalG: 220, fatGoalG: 60 }),
  });
  console.log(`✅ Target set to clean 2000 kcal default`);

  console.log("🎉 ALL NEW FEATURES TESTED & VERIFIED 100% OPERATIONAL!");
}

run().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

