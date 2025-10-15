import Link from 'next/link';

/**
 * 404 Not Found page for Next.js App Router
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface rounded-lg p-8 border border-border text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.5a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">404 - Seite nicht gefunden</h1>
          <p className="text-text-muted mb-6">
            Die gesuchte Seite existiert nicht oder wurde verschoben.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/app"
            className="w-full bg-brand text-black px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors inline-block"
          >
            Zur App
          </Link>
          
          <Link
            href="/"
            className="w-full bg-surface text-foreground px-6 py-3 rounded-lg font-medium border border-border hover:bg-surface-hover transition-colors inline-block"
          >
            Zur Startseite
          </Link>
        </div>

        <div className="mt-6 text-sm text-text-muted">
          <p>Häufige Seiten:</p>
          <div className="mt-2 space-y-1">
            <Link href="/app/plans" className="block hover:text-foreground transition-colors">
              → Trainingspläne
            </Link>
            <Link href="/app/sessions" className="block hover:text-foreground transition-colors">
              → Sessions
            </Link>
            <Link href="/app/calendar" className="block hover:text-foreground transition-colors">
              → Kalender
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

