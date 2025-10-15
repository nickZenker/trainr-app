# 🚨 URGENT: Database Fix Required

## Problem
Die Tabellen `live_sessions` und `set_logs` existieren nicht in deiner Supabase-Datenbank.

**Fehler:** `Could not find the table 'public.live_sessions' in the schema cache`

## ⚡ SOFORTIGE LÖSUNG

### Schritt 1: Supabase Dashboard öffnen
1. Gehe zu: https://supabase.com/dashboard
2. Wähle dein Projekt aus
3. Klicke auf **"SQL Editor"** in der linken Sidebar
4. Klicke auf **"New query"**

### Schritt 2: Dieses SQL kopieren und einfügen

```sql
-- ================================================
-- Create live_sessions table
-- ================================================
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

-- ================================================
-- Create set_logs table
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
-- Enable Row Level Security
-- ================================================
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;

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
```

### Schritt 3: SQL ausführen
1. **Kopiere den gesamten SQL-Code oben**
2. **Füge ihn in die SQL Console ein**
3. **Klicke auf "Run"**

### Schritt 4: Testen
Nach dem Ausführen:
1. Gehe zu: http://localhost:3001/app/live/1
2. Klicke auf **"Neue Live-Session starten"**
3. **Es sollte jetzt funktionieren!** 🎉

## ✅ Was passiert nach dem Fix
- ✅ `live_sessions` Tabelle wird erstellt
- ✅ `set_logs` Tabelle wird erstellt
- ✅ Row Level Security wird aktiviert
- ✅ Alle Sicherheitsrichtlinien werden gesetzt
- ✅ Live-Training funktioniert komplett

## 🔧 Zusätzlich: .env.local prüfen
Stelle sicher, dass deine `.env.local` Datei diese Werte hat:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fifktofyjgxyongylryn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_anon_key_hier
SUPABASE_SERVICE_KEY=dein_service_key_hier
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Trainr App
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=true
```

**Wichtig:** Ersetze `dein_anon_key_hier` und `dein_service_key_hier` mit den echten Werten aus deinem Supabase Dashboard.

