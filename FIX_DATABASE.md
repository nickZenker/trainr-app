# 🚨 DATABASE FIX NEEDED

## Problem
Die Tabellen `live_sessions` und `set_logs` existieren nicht in der Supabase-Datenbank.

**Fehler:** `Could not find the table 'public.live_sessions' in the schema cache`

## Lösung

### Schritt 1: Supabase SQL Console öffnen
1. Gehe zu deinem Supabase Dashboard
2. Klicke auf "SQL Editor" in der linken Sidebar
3. Klicke auf "New query"

### Schritt 2: SQL ausführen
Kopiere den gesamten Inhalt der Datei `database/fix_live_sessions.sql` und füge ihn in die SQL Console ein.

**Oder kopiere diesen Code direkt:**

```sql
-- Live sessions (when user is actively training)
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

-- Set logs (actual performed sets)
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

-- Enable RLS
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own live sessions" ON live_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own live sessions" ON live_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own live sessions" ON live_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own live sessions" ON live_sessions
  FOR DELETE USING (auth.uid() = user_id);

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

### Schritt 3: Ausführen
Klicke auf "Run" um das SQL auszuführen.

### Schritt 4: Testen
Nach dem Ausführen sollte der "Neue Live-Session starten" Button funktionieren!

## Was passiert?
- ✅ Erstellt `live_sessions` Tabelle
- ✅ Erstellt `set_logs` Tabelle  
- ✅ Aktiviert Row Level Security (RLS)
- ✅ Setzt Sicherheitsrichtlinien
- ✅ Live-Training funktioniert wieder

