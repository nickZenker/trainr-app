import { supabaseServerWithCookies } from '../../../../lib/supabaseServer';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DatabaseCheckPage() {
  // Check authentication first
  const supabase = await supabaseServerWithCookies();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/auth/login');
  }

  // Define tables to check
  const tablesToCheck = [
    'profiles',
    'plans', 
    'sessions',
    'exercises',
    'exercise_variants',
    'session_exercises',
    'set_schemas',
    'live_sessions',
    'set_logs'
  ];

  const results = [];

  // Check each table
  for (const tableName of tablesToCheck) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);
      
      if (error) {
        results.push({
          table: tableName,
          status: '❌',
          message: error.message.includes('relation') ? 'Table does not exist' : error.message
        });
      } else {
        results.push({
          table: tableName,
          status: '✅',
          message: 'Table exists and accessible'
        });
      }
    } catch (err) {
      results.push({
        table: tableName,
        status: '❌',
        message: `Connection error: ${err.message}`
      });
    }
  }

  const successCount = results.filter(r => r.status === '✅').length;
  const totalCount = results.length;

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand mb-2">Database Schema Check</h1>
          <p className="text-text-muted">
            Internal tool to verify database tables are properly set up
          </p>
        </header>

        <div className="bg-surface rounded-lg border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-muted">Tables checked:</span>
              <span className="font-mono ml-2">{totalCount}</span>
            </div>
            <div>
              <span className="text-text-muted">Success rate:</span>
              <span className={`font-mono ml-2 ${successCount === totalCount ? 'text-green-400' : 'text-yellow-400'}`}>
                {successCount}/{totalCount} ({Math.round((successCount/totalCount) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Table Status</h2>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background rounded border border-border">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{result.status}</span>
                  <span className="font-mono text-sm">{result.table}</span>
                </div>
                <span className="text-sm text-text-muted">{result.message}</span>
              </div>
            ))}
          </div>
        </div>

        {successCount === totalCount && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h3 className="text-green-400 font-semibold mb-2">✅ All tables verified!</h3>
            <p className="text-green-300 text-sm">
              Database schema is properly set up. You can now use the application normally.
            </p>
          </div>
        )}

        {successCount < totalCount && (
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Schema issues detected</h3>
            <p className="text-yellow-300 text-sm">
              Some tables are missing. Please run the COMPLETE_DATABASE_FIX.sql script in Supabase.
            </p>
          </div>
        )}

        <div className="mt-8 p-4 bg-surface rounded-lg border border-border">
          <h3 className="font-semibold mb-2">Instructions</h3>
          <ol className="text-sm text-text-muted space-y-1 list-decimal list-inside">
            <li>Copy the SQL blocks from COMPLETE_DATABASE_FIX.sql</li>
            <li>Execute them in Supabase SQL Editor in order: A → B → C</li>
            <li>Refresh this page to verify all tables exist</li>
            <li>Once all ✅, the app should work normally</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
