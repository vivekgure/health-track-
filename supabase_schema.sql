-- =========================================================
-- LifeSync: Supabase PostgreSQL Schema with Row Level Security (RLS)
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INT DEFAULT 28,
    gender TEXT DEFAULT 'not_specified',
    height_cm NUMERIC DEFAULT 175,
    weight_kg NUMERIC DEFAULT 70,
    activity_level TEXT DEFAULT 'moderate',
    sleep_target_hours NUMERIC DEFAULT 8.0,
    step_goal INT DEFAULT 10000,
    water_goal_ml INT DEFAULT 2500,
    calorie_goal INT DEFAULT 2200,
    protein_goal_g INT DEFAULT 120,
    carbs_goal_g INT DEFAULT 250,
    fat_goal_g INT DEFAULT 65,
    screen_time_limit_minutes INT DEFAULT 240,
    theme_preference TEXT DEFAULT 'dark',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sleep Sessions
CREATE TABLE IF NOT EXISTS public.sleep_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INT,
    quality_rating INT CHECK (quality_rating BETWEEN 1 AND 5),
    sleep_consistency INT CHECK (sleep_consistency BETWEEN 0 AND 100),
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activity Records
CREATE TABLE IF NOT EXISTS public.activity_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL,
    duration_minutes INT NOT NULL,
    distance_km NUMERIC DEFAULT 0,
    calories_burned INT NOT NULL,
    steps INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Daily Steps
CREATE TABLE IF NOT EXISTS public.daily_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    steps INT DEFAULT 0,
    goal INT DEFAULT 10000,
    distance_km NUMERIC DEFAULT 0,
    calories_burned INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 5. Food Entries
CREATE TABLE IF NOT EXISTS public.food_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    food_name TEXT NOT NULL,
    serving_size TEXT DEFAULT '1 serving',
    calories INT NOT NULL,
    protein_g NUMERIC DEFAULT 0,
    carbs_g NUMERIC DEFAULT 0,
    fat_g NUMERIC DEFAULT 0,
    fiber_g NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Water Logs
CREATE TABLE IF NOT EXISTS public.water_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    amount_ml INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Screen Time Records
CREATE TABLE IF NOT EXISTS public.screen_time_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    app_name TEXT NOT NULL,
    duration_minutes INT NOT NULL,
    is_productive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Focus Sessions
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    duration_minutes INT DEFAULT 25,
    tag TEXT DEFAULT 'Deep Work',
    completed BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Habits
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'wellness',
    target_days_per_week INT DEFAULT 7,
    color TEXT DEFAULT '#10B981',
    icon TEXT DEFAULT 'CheckCircle',
    reminder_time TIME,
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Habit Completions
CREATE TABLE IF NOT EXISTS public.habit_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(habit_id, date)
);

-- 11. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies ensuring users can ONLY access their own records
CREATE POLICY "Users can manage their own profile" ON public.profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sleep sessions" ON public.sleep_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own activity records" ON public.activity_records
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own daily steps" ON public.daily_steps
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own food entries" ON public.food_entries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own water logs" ON public.water_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own screen time" ON public.screen_time_records
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own focus sessions" ON public.focus_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own habits" ON public.habits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own habit completions" ON public.habit_completions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

