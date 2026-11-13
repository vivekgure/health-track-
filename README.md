# LifeSync – Complete Personal Wellness & Productivity Platform

**LifeSync** is a full-stack, personal wellness and productivity platform engineered to help individuals master their daily routines across five foundational wellness pillars: **Sleep, Physical Activity, Nutrition, Screen Time, and Habit Discipline**.

Built with Next.js 15, TypeScript, Tailwind CSS, Prisma, SQLite, and compatible with Supabase PostgreSQL.

---

## 🌟 Key Features

### 1. 🌙 Real Sleep Tracking with Start/Stop Sanctuary
- **Start / Stop Controls**: Live tracking with database timestamps, preserving in-progress sessions across browser reloads or tab closures.
- **Cross-Midnight Calculation**: Automatically handles circadian sleep cycles crossing midnight.
- **Ambient Night Mode Sanctuary**: Minimalist dark screen with animated moon, twinkling stars, and elapsed time counter (`HH:MM:SS`).
- **Sleep Quality & Consistency**: Star rating (1-5), waking dream notes, and schedule consistency analytics based on circadian bedtime variance.
- **Clinical Transparency**: Clear disclaimer stating that tracking is based on user timestamps rather than clinical polysomnography or EEG devices.

### 2. 👟 Activity & Step Tracker
- **Step Counter**: Live daily step gauge with goal progress bar, distance (km), and active calorie calculation.
- **Fast Step Logger**: 1-click `+500`, `+1,000`, `+2,500` step additions or exact pedometer values.
- **Workout Diary**: Log Brisk Walking, Outdoor Running, Cycling, Strength Training, HIIT, Yoga, and Swimming.
- **Native Health Sync Architecture**: Integration hubs for Google Health Connect (Android) and Apple HealthKit (iOS).

### 3. 🥗 Nutrition & Macro Food Diary
- **Nutritional Balance**: Tracks Calories, Protein (g), Carbohydrates (g), Fat (g), and Fiber (g).
- **Meal Categorization**: Breakfast, Lunch, Dinner, and Snacks.
- **Foods Library & Custom Foods**: Searchable preset healthy foods library plus custom food creator with serving size and macros.
- **Hydration Tracker**: Daily water progress bar (`ml / target`) with 1-click glass (`+250ml`) and bottle (`+500ml`) buttons.
- **Balanced Eating Insights**: Dynamic dietary feedback generated from logged macro ratios.

### 4. 🧘 Mindful Screen Time & Focus Management
- **Digital Wellbeing Analytics**: Category breakdown (Productivity, Social Media, Entertainment, Utility, Health).
- **Focus Shield (ON / OFF)**: Distraction controller with interactive Pomodoro / Deep Work timer (25m, 50m, custom) and soothing ambient pink noise synthesizer.
- **Chrome Companion Extension**: Bundled in `/extension` with Manifest V3. Redirects distracting domains (YouTube, Reddit, Twitter, TikTok, Facebook) to the peaceful Mindful Breathing Sanctuary during focus mode.

### 5. 🔥 Habit Tracker & Streaks
- **Daily Checklist**: Interactive checkmarks with celebratory confetti upon completion.
- **Streak Accountability**: Current continuous streak counter and longest active streak badges.
- **7-Day Consistency Matrix**: Visual matrix heatmap across all routines.
- **Custom Habits**: Configurable categories (Wellness, Fitness, Productivity, Mindfulness), target days, colors, and reminder times.

### 6. 📊 Advanced Analytics & Reports
- **LifeSync Wellness Composite Score (0-100)**: Evaluates sleep, physical activity, nutrition balance, habit discipline, and digital wellbeing.
- **Interactive Recharts**: Multi-metric trend lines, area plots, and bar distributions across 7, 30, and 90-day windows.
- **Full Data Portability**: 1-click full JSON database export (`/api/export`) and print-ready PDF wellness summary reports.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Recharts, Canvas Confetti.
- **Backend**: Next.js API Route Handlers, JWT (`jose`), bcrypt password hashing.
- **Database**: Prisma ORM with SQLite (`dev.db`) for immediate zero-config persistence, plus production Supabase PostgreSQL migration script (`supabase_schema.sql`) with Row Level Security (RLS).
- **PWA**: Installable Progressive Web App (`manifest.json`, `sw.js`).
- **Browser Companion**: Chrome Extension Manifest V3 in `/extension`.

---

## ⚡ Quick Evaluation & Demo Login
LifeSync comes seeded with authentic 14-day history for the demo user:
- **Email**: `demo@lifesync.app`
- **Password**: `password123`
- *Or click the **"⚡ Launch Demo Dashboard"** button on the login screen for instant 1-click access!*

---

## 🚀 Running the Project
```bash
# 1. Install dependencies
npm install

# 2. Push database schema & seed demo data
npx prisma db push
node prisma/seed.mjs

# 3. Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

