-- ================================================
-- COMPLETE DATABASE SETUP
-- Führt alle fehlenden Tabellen und Policies ein
-- ================================================

-- Enable RLS on auth.users (should be already enabled)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- ================================================
-- Profiles table (extends auth.users)
-- ================================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  birthdate DATE,
  unit_mass TEXT DEFAULT 'kg' CHECK (unit_mass IN ('kg', 'lbs')),
  unit_length TEXT DEFAULT 'cm' CHECK (unit_length IN ('cm', 'ft', 'in')),
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  locale TEXT DEFAULT 'de',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Plans table
-- ================================================
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  active BOOLEAN DEFAULT true,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Sessions table
-- ================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('strength', 'cardio')),
  name TEXT NOT NULL,
  weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6), -- 0=Sunday, 6=Saturday
  time TIME,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Exercises table (global + user-specific)
-- ================================================
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = global exercise
  name TEXT NOT NULL,
  muscle_primary TEXT,
  muscle_secondary TEXT[],
  equipment TEXT[],
  favorite_variant TEXT,
  media_url TEXT,
  technique_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Exercise variants table
-- ================================================
CREATE TABLE IF NOT EXISTS exercise_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('machine', 'barbell', 'dumbbell', 'cable', 'bodyweight', 'kettlebell', 'resistance_band')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Session exercises (exercises in a session)
-- ================================================
CREATE TABLE IF NOT EXISTS session_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  selected_variant TEXT,
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Set schemas (planned sets for exercises)
-- ================================================
CREATE TABLE IF NOT EXISTS set_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id UUID NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  set_index INTEGER NOT NULL,
  planned_reps INTEGER,
  planned_weight DECIMAL(5,2),
  rir_or_rpe INTEGER CHECK (rir_or_rpe >= 1 AND rir_or_rpe <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Live sessions (when user is actively training)
-- ================================================
CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('strength', 'cardio')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  duration_sec INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'aborted'))
);

-- ================================================
-- Set logs (actual performed sets)
-- ================================================
CREATE TABLE IF NOT EXISTS set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  session_exercise_id UUID REFERENCES session_exercises(id) ON DELETE SET NULL,
  variant TEXT,
  set_index INTEGER NOT NULL,
  actual_reps INTEGER,
  actual_weight DECIMAL(5,2),
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  notes TEXT,
  auto_progression_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Enable Row Level Security on all tables
-- ================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS Policies for profiles
-- ================================================
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ================================================
-- RLS Policies for plans
-- ================================================
CREATE POLICY "Users can view their own plans" ON plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans" ON plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" ON plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans" ON plans
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- RLS Policies for sessions
-- ================================================
CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = sessions.plan_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own sessions" ON sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = sessions.plan_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own sessions" ON sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = sessions.plan_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own sessions" ON sessions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = sessions.plan_id 
      AND plans.user_id = auth.uid()
    )
  );

-- ================================================
-- RLS Policies for exercises
-- ================================================
CREATE POLICY "Users can view global and their own exercises" ON exercises
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercises" ON exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercises" ON exercises
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercises" ON exercises
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- RLS Policies for exercise_variants
-- ================================================
CREATE POLICY "Users can view variants of accessible exercises" ON exercise_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exercises 
      WHERE exercises.id = exercise_variants.exercise_id 
      AND (exercises.user_id IS NULL OR exercises.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert variants for their exercises" ON exercise_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises 
      WHERE exercises.id = exercise_variants.exercise_id 
      AND exercises.user_id = auth.uid()
    )
  );

-- ================================================
-- RLS Policies for session_exercises
-- ================================================
CREATE POLICY "Users can view their own session exercises" ON session_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions 
      JOIN plans ON plans.id = sessions.plan_id
      WHERE sessions.id = session_exercises.session_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own session exercises" ON session_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      JOIN plans ON plans.id = sessions.plan_id
      WHERE sessions.id = session_exercises.session_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own session exercises" ON session_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sessions 
      JOIN plans ON plans.id = sessions.plan_id
      WHERE sessions.id = session_exercises.session_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own session exercises" ON session_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM sessions 
      JOIN plans ON plans.id = sessions.plan_id
      WHERE sessions.id = session_exercises.session_id 
      AND plans.user_id = auth.uid()
    )
  );

-- ================================================
-- RLS Policies for set_schemas
-- ================================================
CREATE POLICY "Users can view their own set schemas" ON set_schemas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM session_exercises 
      JOIN sessions ON sessions.id = session_exercises.session_id
      JOIN plans ON plans.id = sessions.plan_id
      WHERE session_exercises.id = set_schemas.session_exercise_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own set schemas" ON set_schemas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM session_exercises 
      JOIN sessions ON sessions.id = session_exercises.session_id
      JOIN plans ON plans.id = sessions.plan_id
      WHERE session_exercises.id = set_schemas.session_exercise_id 
      AND plans.user_id = auth.uid()
    )
  );

-- ================================================
-- RLS Policies for live_sessions
-- ================================================
CREATE POLICY "Users can view their own live sessions" ON live_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own live sessions" ON live_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own live sessions" ON live_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own live sessions" ON live_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- RLS Policies for set_logs
-- ================================================
CREATE POLICY "Users can view their own set logs" ON set_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM live_sessions 
      WHERE live_sessions.id = set_logs.live_session_id 
      AND live_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own set logs" ON set_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM live_sessions 
      WHERE live_sessions.id = set_logs.live_session_id 
      AND live_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own set logs" ON set_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM live_sessions 
      WHERE live_sessions.id = set_logs.live_session_id 
      AND live_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own set logs" ON set_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM live_sessions 
      WHERE live_sessions.id = set_logs.live_session_id 
      AND live_sessions.user_id = auth.uid()
    )
  );
