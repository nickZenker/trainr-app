'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'Dashboard', href: '/app' },
  { label: 'Plans', href: '/app/plans' },
  { label: 'Sessions', href: '/app/sessions' },
  { label: 'Live', href: '/app/live' },
  { label: 'Routes', href: '/app/routes' },
  { label: 'Progress', href: '/app/progress' },
  { label: 'Profile', href: '/app/profile' },
  // Gesundheitsbereiche:
  { label: 'Nutrition', href: '/app/nutrition' },
  { label: 'Sleep', href: '/app/sleep' },
  { label: 'Recovery', href: '/app/recovery' },
  { label: 'Body', href: '/app/body' }
];

export default function TopNavTabs() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || 
              (tab.href !== '/app' && pathname.startsWith(tab.href));
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  relative py-4 px-1 text-sm font-medium transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-background
                  ${isActive 
                    ? 'text-brand border-b-2 border-brand' 
                    : 'text-text-muted hover:text-foreground hover:border-b-2 hover:border-border'
                  }
                  whitespace-nowrap
                `}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
