# 🚨 SOFORTIGE DATENBANK-EINRICHTUNG ERFORDERLICH

## Problem
Die App zeigt "Internal Server Error" weil **ALLE** Datenbank-Tabellen fehlen:

```
Could not find the table 'public.plans' in the schema cache
Could not find the table 'public.live_sessions' in the schema cache
```

## ⚡ LÖSUNG (5 Minuten)

### Schritt 1: Supabase Dashboard öffnen
1. Gehe zu: https://supabase.com/dashboard
2. Wähle dein Projekt aus
3. Klicke auf **"SQL Editor"** (linke Sidebar)
4. Klicke auf **"New query"**

### Schritt 2: Komplettes SQL ausführen
**Kopiere den INHALT der Datei `COMPLETE_DATABASE_FIX.sql`** und füge ihn in die SQL Console ein.

**Oder kopiere diesen Code direkt:**

```sql
-- Enable RLS on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Profiles table
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

-- Plans table
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

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('strength', 'cardio')),
  name TEXT NOT NULL,
  weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  time TIME,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Exercise variants table
CREATE TABLE IF NOT EXISTS exercise_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('machine', 'barbell', 'dumbbell', 'cable', 'bodyweight', 'kettlebell', 'resistance_band')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session exercises table
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

-- Set schemas table
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

-- Live sessions table
CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('strength', 'cardio')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  duration_sec INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'aborted'))
);

-- Set logs table
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

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (simplified for now)
CREATE POLICY "Users can manage their own data" ON profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON sessions FOR ALL USING (EXISTS (SELECT 1 FROM plans WHERE plans.id = sessions.plan_id AND plans.user_id = auth.uid()));
CREATE POLICY "Users can manage their own data" ON exercises FOR ALL USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON exercise_variants FOR ALL USING (EXISTS (SELECT 1 FROM exercises WHERE exercises.id = exercise_variants.exercise_id AND (exercises.user_id IS NULL OR exercises.user_id = auth.uid())));
CREATE POLICY "Users can manage their own data" ON session_exercises FOR ALL USING (EXISTS (SELECT 1 FROM sessions JOIN plans ON plans.id = sessions.plan_id WHERE sessions.id = session_exercises.session_id AND plans.user_id = auth.uid()));
CREATE POLICY "Users can manage their own data" ON set_schemas FOR ALL USING (EXISTS (SELECT 1 FROM session_exercises JOIN sessions ON sessions.id = session_exercises.session_id JOIN plans ON plans.id = sessions.plan_id WHERE session_exercises.id = set_schemas.session_exercise_id AND plans.user_id = auth.uid()));
CREATE POLICY "Users can manage their own data" ON live_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON set_logs FOR ALL USING (EXISTS (SELECT 1 FROM live_sessions WHERE live_sessions.id = set_logs.live_session_id AND live_sessions.user_id = auth.uid()));
```

### Schritt 3: SQL ausführen
1. **Kopiere den gesamten SQL-Code oben**
2. **Füge ihn in die SQL Console ein**
3. **Klicke auf "Run"**

### Schritt 4: App neu starten
Nach dem SQL-Ausführen:
1. Gehe zurück zum Terminal
2. Starte die App neu: `PORT=3001 npm run dev`
3. Gehe zu: http://localhost:3001/app
4. **Alles sollte jetzt funktionieren!** 🎉

## ✅ Was passiert nach dem Fix
- ✅ Alle 9 Tabellen werden erstellt
- ✅ Row Level Security wird aktiviert
- ✅ Alle Sicherheitsrichtlinien werden gesetzt
- ✅ Plans, Sessions, Live-Training funktionieren
- ✅ Top-Navigation funktioniert perfekt
- ✅ Keine Internal Server Errors mehr

## 🚨 WICHTIG
**Ohne diese Datenbank-Einrichtung funktioniert NICHTS!** Die App braucht diese Tabellen um zu funktionieren.

