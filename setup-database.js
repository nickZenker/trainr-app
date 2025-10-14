#!/usr/bin/env node

/**
 * Database Setup Script
 * Automatically creates missing tables in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_KEY:', !!supabaseServiceKey);
  console.error('');
  console.error('Please check your .env.local file');
  process.exit(1);
}

// Create Supabase client with service key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up database tables...');
  
  try {
    // Read the SQL file
    const sqlPath = join(__dirname, 'database', 'fix_live_sessions.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('📝 Creating tables directly...');
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`   Executing: ${statement.substring(0, 50)}...`);
          const { error: stmtError } = await supabase.rpc('exec', { sql: statement });
          if (stmtError) {
            console.error(`   ❌ Error: ${stmtError.message}`);
          } else {
            console.log(`   ✅ Success`);
          }
        }
      }
    } else {
      console.log('✅ Database setup completed successfully!');
    }
    
    // Verify tables exist
    console.log('🔍 Verifying tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['live_sessions', 'set_logs']);
    
    if (tablesError) {
      console.error('❌ Could not verify tables:', tablesError.message);
    } else {
      const tableNames = tables.map(t => t.table_name);
      console.log('📋 Found tables:', tableNames);
      
      if (tableNames.includes('live_sessions') && tableNames.includes('set_logs')) {
        console.log('🎉 All required tables exist!');
        console.log('');
        console.log('✅ You can now test the Live Training feature:');
        console.log('   http://localhost:3001/app/live/1');
      } else {
        console.log('❌ Some tables are missing:', tableNames);
      }
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('');
    console.log('🔧 Manual setup required:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Copy and paste the content from database/fix_live_sessions.sql');
    console.log('4. Click Run');
  }
}

setupDatabase();
