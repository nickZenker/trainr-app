'use client';

import Link from 'next/link';
import TopNavTabs from '../TopNavTabs';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* App Header with Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link 
                href="/app" 
                data-testid="logo-home"
                className="text-2xl font-bold text-foreground hover:text-brand transition-colors"
              >
                Trainr App
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-text-muted">
                Hallo, User
              </span>
              <form action="/auth/logout" method="post">
                <button 
                  type="submit"
                  className="text-sm text-text-muted hover:text-foreground transition-colors"
                >
                  Abmelden
                </button>
              </form>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <TopNavTabs />
        </div>
        
        {/* Mega Menu Root - positioned under header */}
        <div id="megamenu-root" className="relative" />
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
