#!/usr/bin/env node

/**
 * Simple Database Fix
 * Creates missing live_sessions and set_logs tables
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env.local file manually
let envContent = '';
try {
  envContent = readFileSync('.env.local', 'utf8');
} catch (error) {
  console.error('❌ Could not read .env.local file');
  process.exit(1);
}

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables in .env.local:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabase() {
  console.log('🔧 Attempting to fix database...');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('🔑 Service Key:', supabaseServiceKey ? 'Present' : 'Missing');
  console.log('');
  
  // Test connection
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return;
  }
  
  // Check if tables exist
  console.log('🔍 Checking existing tables...');
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', ['live_sessions', 'set_logs']);
  
  if (tablesError) {
    console.error('❌ Could not check tables:', tablesError.message);
  } else {
    const existingTables = tables.map(t => t.table_name);
    console.log('📋 Existing tables:', existingTables);
    
    if (existingTables.includes('live_sessions') && existingTables.includes('set_logs')) {
      console.log('🎉 All required tables already exist!');
      console.log('✅ Live Training should work now!');
      return;
    }
  }
  
  console.log('');
  console.log('❌ Tables are missing. Manual setup required:');
  console.log('');
  console.log('📋 Copy this SQL and run it in Supabase SQL Editor:');
  console.log('');
  console.log('-- ================================================');
  console.log('-- Create live_sessions table');
  console.log('-- ================================================');
  console.log(`
CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('strength', 'cardio')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  duration_sec INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'aborted'))
);`);
  
  console.log(`
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
);`);
  
  console.log(`
-- ================================================
-- Enable Row Level Security
-- ================================================
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;`);
  
  console.log(`
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
  FOR DELETE USING (auth.uid() = user_id);`);
  
  console.log(`
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
  );`);
  
  console.log('');
  console.log('-- ================================================');
  console.log('-- End of SQL');
  console.log('-- ================================================');
  console.log('');
  console.log('🎯 Steps to fix:');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Click "SQL Editor" in the left sidebar');
  console.log('4. Click "New query"');
  console.log('5. Copy and paste the SQL above');
  console.log('6. Click "Run"');
  console.log('7. Test: http://localhost:3001/app/live/1');
}

fixDatabase().catch(console.error);
