'use client';

import { useEffect } from 'react';

/**
 * Client-side Error Boundary for Next.js App Router
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Client Error Boundary caught error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface rounded-lg p-8 border border-border text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Oops! Etwas ist schiefgelaufen</h1>
          <p className="text-text-muted mb-6">
            Es ist ein unerwarteter Fehler aufgetreten. Keine Sorge, das passiert manchmal.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full bg-brand text-black px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors"
          >
            Erneut versuchen
          </button>
          
          <button
            onClick={() => window.location.href = '/app'}
            className="w-full bg-surface text-foreground px-6 py-3 rounded-lg font-medium border border-border hover:bg-surface-hover transition-colors"
          >
            Zurück zur Startseite
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-text-muted hover:text-foreground">
              Entwickler-Details
            </summary>
            <pre className="mt-2 text-xs bg-background p-3 rounded border border-border overflow-auto">
              {error?.message || 'Kein Fehler-Detail verfügbar'}
              {error?.stack && (
                <>
                  {'\n\nStack Trace:\n'}
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
