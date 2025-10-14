import Link from 'next/link';

/**
 * Unauthorized access page for admin routes
 */
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface rounded-lg p-8 border border-border text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">401 - Nicht autorisiert</h1>
          <p className="text-text-muted mb-6">
            Du musst dich einloggen, um auf die Admin-Bereiche zuzugreifen.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="w-full bg-brand text-black px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors inline-block"
          >
            Einloggen
          </Link>
          
          <Link
            href="/app"
            className="w-full bg-surface text-foreground px-6 py-3 rounded-lg font-medium border border-border hover:bg-surface-hover transition-colors inline-block"
          >
            Zur App
          </Link>
        </div>

        <div className="mt-6 text-sm text-text-muted">
          <p>Admin-Bereiche sind nur für authentifizierte Benutzer verfügbar.</p>
        </div>
      </div>
    </div>
  );
}
