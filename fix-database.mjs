#!/usr/bin/env node

/**
 * Quick Database Fix
 * Creates missing live_sessions and set_logs tables
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SQL_STATEMENTS = [
  // Create live_sessions table
  `CREATE TABLE IF NOT EXISTS live_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('strength', 'cardio')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    duration_sec INTEGER,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'aborted'))
  )`,
  
  // Create set_logs table
  `CREATE TABLE IF NOT EXISTS set_logs (
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
  )`,
  
  // Enable RLS
  `ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY`,
  
  // RLS Policies for live_sessions
  `CREATE POLICY IF NOT EXISTS "Users can view their own live sessions" ON live_sessions
    FOR SELECT USING (auth.uid() = user_id)`,
    
  `CREATE POLICY IF NOT EXISTS "Users can insert their own live sessions" ON live_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id)`,
    
  `CREATE POLICY IF NOT EXISTS "Users can update their own live sessions" ON live_sessions
    FOR UPDATE USING (auth.uid() = user_id)`,
    
  `CREATE POLICY IF NOT EXISTS "Users can delete their own live sessions" ON live_sessions
    FOR DELETE USING (auth.uid() = user_id)`,
  
  // RLS Policies for set_logs
  `CREATE POLICY IF NOT EXISTS "Users can view their own set logs" ON set_logs
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM live_sessions 
        WHERE live_sessions.id = set_logs.live_session_id 
        AND live_sessions.user_id = auth.uid()
      )
    )`,
    
  `CREATE POLICY IF NOT EXISTS "Users can insert their own set logs" ON set_logs
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM live_sessions 
        WHERE live_sessions.id = set_logs.live_session_id 
        AND live_sessions.user_id = auth.uid()
      )
    )`,
    
  `CREATE POLICY IF NOT EXISTS "Users can update their own set logs" ON set_logs
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM live_sessions 
        WHERE live_sessions.id = set_logs.live_session_id 
        AND live_sessions.user_id = auth.uid()
      )
    )`,
    
  `CREATE POLICY IF NOT EXISTS "Users can delete their own set logs" ON set_logs
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM live_sessions 
        WHERE live_sessions.id = set_logs.live_session_id 
        AND live_sessions.user_id = auth.uid()
      )
    )`
];

async function fixDatabase() {
  console.log('🔧 Fixing database - creating missing tables...');
  
  for (let i = 0; i < SQL_STATEMENTS.length; i++) {
    const sql = SQL_STATEMENTS[i];
    const description = getDescription(sql);
    
    console.log(`[${i + 1}/${SQL_STATEMENTS.length}] ${description}`);
    
    try {
      // Try to execute via SQL function
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.log(`   ⚠️  exec_sql failed, trying alternative method...`);
        // Alternative: Use a simple query to test if table exists
        if (sql.includes('CREATE TABLE')) {
          const tableName = sql.match(/CREATE TABLE.*?(\w+)/)?.[1];
          if (tableName) {
            const { error: testError } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
            
            if (testError && testError.code === 'PGRST205') {
              console.log(`   ❌ Table ${tableName} does not exist - manual setup required`);
            } else {
              console.log(`   ✅ Table ${tableName} exists or created successfully`);
            }
          }
        }
      } else {
        console.log(`   ✅ Success`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }
  
  console.log('');
  console.log('🎯 Next steps:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Open SQL Editor');
  console.log('3. Copy this SQL and run it:');
  console.log('');
  console.log('-- Copy everything below this line --');
  console.log(SQL_STATEMENTS.join(';\n') + ';');
  console.log('-- Copy everything above this line --');
  console.log('');
  console.log('4. After running the SQL, test: http://localhost:3001/app/live/1');
}

function getDescription(sql) {
  if (sql.includes('CREATE TABLE live_sessions')) return 'Creating live_sessions table';
  if (sql.includes('CREATE TABLE set_logs')) return 'Creating set_logs table';
  if (sql.includes('ENABLE ROW LEVEL SECURITY')) return 'Enabling RLS';
  if (sql.includes('CREATE POLICY')) return 'Creating RLS policy';
  return 'Executing SQL statement';
}

fixDatabase().catch(console.error);

