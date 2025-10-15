'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// Training subnav items
const trainingTabs = [
  { label: 'Dashboard', href: '/app', slug: 'dashboard' },
  { label: 'Plans', href: '/app/plans', slug: 'plans' },
  { label: 'Sessions', href: '/app/sessions', slug: 'sessions' },
  { label: 'Live', href: '/app/live/1', slug: 'live' },
  { label: 'Calendar', href: '/app/calendar?view=month', slug: 'calendar' }
];

// Health subnav items
const healthTabs = [
  { label: 'Nutrition', href: '/app/nutrition', slug: 'nutrition' },
  { label: 'Sleep', href: '/app/sleep', slug: 'sleep' },
  { label: 'Recovery', href: '/app/recovery', slug: 'recovery' },
  { label: 'Body', href: '/app/body', slug: 'body' }
];

// Secondary tabs (right side)
const secondaryTabs = [
  { label: 'Progress', href: '/app/progress', slug: 'progress' },
  { label: 'Profile', href: '/app/profile', slug: 'profile' }
];

function SubNavLink({ tab, isActive }) {
  return (
    <Link
      href={tab.href}
      data-testid={`subtab-${tab.slug}`}
      className={`
        relative py-2 px-3 text-sm font-medium transition-colors duration-200 rounded-md
        focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-background
        ${isActive 
          ? 'bg-brand/10 text-brand' 
          : 'text-text-muted hover:text-foreground hover:bg-surface'
        }
        whitespace-nowrap
      `}
      role="tab"
      aria-selected={isActive}
    >
      {tab.label}
    </Link>
  );
}

function PrimaryTab({ label, tabs, pathname, testId }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveTab = tabs.some(tab => 
    pathname === tab.href || 
    (tab.href !== '/app' && pathname.startsWith(tab.href)) ||
    (tab.href === '/app' && pathname === '/app')
  );

  return (
    <div className="relative">
      <button
        data-testid={testId}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative py-4 px-3 text-sm font-medium transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-background
          ${hasActiveTab 
            ? 'text-brand border-b-2 border-brand' 
            : 'text-text-muted hover:text-foreground hover:border-b-2 hover:border-border'
          }
          whitespace-nowrap
        `}
        role="tab"
        aria-selected={hasActiveTab}
      >
        {label}
        {hasActiveTab && (
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />
        )}
      </button>
      
      {/* Subnav - Desktop: below, Mobile: scrollable */}
      <div className={`
        ${isOpen ? 'block' : 'hidden'}
        lg:absolute lg:top-full lg:left-0 lg:mt-1 lg:w-64 lg:bg-background lg:border lg:border-border lg:rounded-lg lg:shadow-lg lg:z-50
        mobile:block mobile:mt-2 mobile:bg-transparent mobile:border-0 mobile:shadow-none
      `}>
        <div className="flex flex-wrap gap-1 lg:flex-col lg:gap-0 lg:p-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || 
              (tab.href !== '/app' && pathname.startsWith(tab.href)) ||
              (tab.href === '/app' && pathname === '/app');
            
            return (
              <SubNavLink 
                key={tab.href} 
                tab={tab} 
                isActive={isActive}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SecondaryTab({ tab, isActive }) {
  return (
    <Link
      href={tab.href}
      data-testid={`tab-${tab.slug}`}
      className={`
        relative py-4 px-3 text-sm font-medium transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-background
        ${isActive 
          ? 'text-brand border-b-2 border-brand' 
          : 'text-text-muted hover:text-foreground hover:border-b-2 hover:border-border'
        }
        whitespace-nowrap
      `}
      role="tab"
      aria-selected={isActive}
    >
      {tab.label}
      {isActive && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />
      )}
    </Link>
  );
}

export default function TopNavTabs() {
  const pathname = usePathname();

  return (
    <nav 
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border" 
      data-testid="topnav-home"
      role="tablist"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Primary Tabs Row */}
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {/* Training Primary Tab */}
          <PrimaryTab 
            label="Training" 
            tabs={trainingTabs} 
            pathname={pathname}
            testId="tab-primary-training"
          />
          
          {/* Health Primary Tab */}
          <PrimaryTab 
            label="Health" 
            tabs={healthTabs} 
            pathname={pathname}
            testId="tab-primary-health"
          />
          
          {/* Spacer to push secondary tabs to the right */}
          <div className="flex-1" />
          
          {/* Secondary Tabs */}
          {secondaryTabs.map((tab) => {
            const isActive = pathname === tab.href || 
              (tab.href !== '/app' && pathname.startsWith(tab.href));
            
            return (
              <SecondaryTab 
                key={tab.href} 
                tab={tab} 
                isActive={isActive}
              />
            );
          })}
        </div>
      </div>
    </nav>
  );
}
