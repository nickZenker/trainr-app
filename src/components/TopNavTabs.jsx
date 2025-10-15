'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// Tab-Gruppen für bessere UX
const primaryTabs = [
  { label: 'Dashboard', href: '/app' },
  { label: 'Plans', href: '/app/plans' },
  { label: 'Sessions', href: '/app/sessions' },
  { label: 'Calendar', href: '/app/calendar' },
  { label: 'Live', href: '/app/live' },
  { label: 'Progress', href: '/app/progress' }
];

const secondaryTabs = [
  { label: 'Routes', href: '/app/routes' },
  { label: 'Profile', href: '/app/profile' }
];

const healthTabs = [
  { label: 'Nutrition', href: '/app/nutrition' },
  { label: 'Sleep', href: '/app/sleep' },
  { label: 'Recovery', href: '/app/recovery' },
  { label: 'Body', href: '/app/body' }
];

function TabLink({ tab, isActive }) {
  return (
    <Link
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
}

function DropdownMenu({ label, tabs, pathname }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveTab = tabs.some(tab => 
    pathname === tab.href || (tab.href !== '/app' && pathname.startsWith(tab.href))
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative py-4 px-1 text-sm font-medium transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-background
          ${hasActiveTab 
            ? 'text-brand border-b-2 border-brand' 
            : 'text-text-muted hover:text-foreground hover:border-b-2 hover:border-border'
          }
          whitespace-nowrap
        `}
      >
        {label} ▼
        {hasActiveTab && (
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />
        )}
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || 
              (tab.href !== '/app' && pathname.startsWith(tab.href));
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setIsOpen(false)}
                className={`
                  block px-4 py-2 text-sm transition-colors duration-200
                  ${isActive 
                    ? 'bg-brand/10 text-brand' 
                    : 'text-text-muted hover:text-foreground hover:bg-surface'
                  }
                `}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TopNavTabs() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border" data-testid="topnav-home">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
          {/* Primary Tabs - immer sichtbar */}
          {primaryTabs.map((tab) => {
            const isActive = pathname === tab.href || 
              (tab.href !== '/app' && pathname.startsWith(tab.href));
            
            return (
              <TabLink key={tab.href} tab={tab} isActive={isActive} />
            );
          })}
          
          {/* Secondary Dropdown */}
          <DropdownMenu 
            label="More" 
            tabs={secondaryTabs} 
            pathname={pathname} 
          />
          
          {/* Health Dropdown */}
          <DropdownMenu 
            label="Health" 
            tabs={healthTabs} 
            pathname={pathname} 
          />
        </div>
      </div>
    </nav>
  );
}
