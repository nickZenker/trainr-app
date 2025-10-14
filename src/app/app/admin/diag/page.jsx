import { supabaseServerWithCookies } from "@/lib/supabaseServer";
import { getRecentLogs } from "@/lib/logger";

export const dynamic = 'force-dynamic';

/**
 * Diagnostic page for development troubleshooting
 * Shows system status, environment, and recent logs
 */
export default async function DiagnosticPage() {
  const startTime = Date.now();
  
  // System information
  const nodeVersion = process.version;
  const memoryUsage = Math.round(process.memoryUsage().rss / 1024 / 1024); // MB
  
  // Environment variables (presence only)
  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
    NODE_ENV: !!process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: !!process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
  };
  
  // Get .env file names (without values)
  let envFileNames = [];
  try {
    const fs = require('fs');
    const path = require('path');
    const envFiles = ['.env.local', '.env.development', '.env.production', '.env'];
    
    envFileNames = envFiles.filter(file => {
      try {
        return fs.existsSync(path.join(process.cwd(), file));
      } catch {
        return false;
      }
    });
  } catch {
    envFileNames = ['Unable to read env files'];
  }
  
  // Test Supabase connection
  let supabaseStatus = 'FAIL';
  let supabaseError = null;
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      supabaseError = error.message;
    } else {
      supabaseStatus = 'OK';
    }
  } catch (error) {
    supabaseError = error.message;
  }
  
  // Get recent logs (development only)
  const recentLogs = process.env.NODE_ENV === 'development' ? getRecentLogs(10) : [];
  
  const loadTime = Date.now() - startTime;

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">System-Diagnose</h1>
          <p className="text-text-muted">
            Entwicklungs-Tools für Fehlerdiagnose und System-Status
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <div className="bg-surface rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">System-Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-muted">Zeit:</span>
                <span className="font-mono text-sm">{new Date().toISOString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Node Version:</span>
                <span className="font-mono text-sm">{nodeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Memory Usage:</span>
                <span className="font-mono text-sm">{memoryUsage} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Load Time:</span>
                <span className="font-mono text-sm">{loadTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Environment:</span>
                <span className={`font-mono text-sm px-2 py-1 rounded ${
                  process.env.NODE_ENV === 'development' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {process.env.NODE_ENV}
                </span>
              </div>
            </div>
          </div>

          {/* Supabase Status */}
          <div className="bg-surface rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Supabase-Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Verbindung:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  supabaseStatus === 'OK' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {supabaseStatus}
                </span>
              </div>
              {supabaseError && (
                <div className="mt-3">
                  <span className="text-text-muted text-sm">Fehler:</span>
                  <pre className="mt-1 text-xs bg-background p-2 rounded border border-border text-red-600 dark:text-red-400 overflow-auto">
                    {supabaseError}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-surface rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Environment Variables</h2>
            <div className="space-y-2">
              {Object.entries(envStatus).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">{key}:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    value 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {value ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <span className="text-text-muted text-sm">Env-Dateien:</span>
              <div className="mt-1 text-xs text-foreground">
                {envFileNames.length > 0 ? envFileNames.join(', ') : 'Keine gefunden'}
              </div>
            </div>
          </div>

          {/* Recent Logs (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-surface rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Letzte Logs (DEV)</h2>
              {recentLogs.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentLogs.map((log, index) => (
                    <div key={index} className="text-xs bg-background p-2 rounded border border-border">
                      <div className="font-medium text-foreground">{log.header}</div>
                      <div className="text-text-muted mt-1">{log.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm">Keine Logs verfügbar</p>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Schnellaktionen</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/api/health" 
              target="_blank"
              className="bg-brand text-black px-4 py-2 rounded font-medium hover:bg-brand-hover transition-colors text-center"
            >
              Health Check öffnen
            </a>
            <a 
              href="/app/admin/db-check" 
              className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors text-center"
            >
              DB Schema Check
            </a>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded font-medium hover:bg-gray-700 transition-colors"
            >
              Seite neu laden
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-text-muted">
          <p>
            Diese Seite ist nur für Entwicklungszwecke gedacht. 
            {process.env.NODE_ENV !== 'development' && ' Einige Funktionen sind in der Produktion deaktiviert.'}
          </p>
        </div>
      </div>
    </div>
  );
}
