'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useOutsideKeyClose } from '../hooks/useOutsideKeyClose';

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

function DropdownMenuItem({ tab, isActive, onClose }) {
  return (
    <Link
      href={tab.href}
      data-testid={`subnav-item-${tab.slug}`}
      onClick={onClose}
      className={`
        block px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-background
        ${isActive 
          ? 'bg-brand/10 text-brand' 
          : 'text-text-muted hover:text-foreground hover:bg-surface'
        }
      `}
      role="menuitem"
      tabIndex={-1}
    >
      {tab.label}
    </Link>
  );
}

function DropdownPanel({ label, tabs, pathname, isOpen, onClose, triggerId, panelId }) {
  const { ref, handleKeyDown } = useOutsideKeyClose(isOpen, onClose);
  const menuRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstItem = menuRef.current.querySelector('[role="menuitem"]');
      if (firstItem) {
        firstItem.focus();
        setFocusedIndex(0);
      }
    } else {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleMenuKeyDown = (event) => {
    if (!isOpen) return;

    const items = menuRef.current?.querySelectorAll('[role="menuitem"]') || [];
    const itemCount = items.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => (prev + 1) % itemCount);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => prev <= 0 ? itemCount - 1 : prev - 1);
        break;
      case 'ArrowRight':
      case 'ArrowLeft':
        event.preventDefault();
        // For horizontal navigation, we can cycle through items
        setFocusedIndex(prev => (prev + 1) % itemCount);
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(itemCount - 1);
        break;
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
    }
  };

  // Update focus when focusedIndex changes
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const items = menuRef.current.querySelectorAll('[role="menuitem"]');
      if (items[focusedIndex]) {
        items[focusedIndex].focus();
      }
    }
  }, [focusedIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      data-testid={panelId}
      className="absolute top-full left-0 right-0 mt-1 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-lg ring-1 ring-black/5 z-50 max-h-[min(70vh,32rem)] overflow-y-auto"
      role="menu"
      onKeyDown={handleMenuKeyDown}
    >
      <div className="p-4">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          {label}
        </h3>
        <div 
          ref={menuRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1"
        >
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || 
              (tab.href !== '/app' && pathname.startsWith(tab.href)) ||
              (tab.href === '/app' && pathname === '/app');
            
            return (
              <DropdownMenuItem 
                key={tab.href} 
                tab={tab} 
                isActive={isActive}
                onClose={onClose}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PrimaryTab({ label, tabs, pathname, triggerId, panelId }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveTab = tabs.some(tab => 
    pathname === tab.href || 
    (tab.href !== '/app' && pathname.startsWith(tab.href)) ||
    (tab.href === '/app' && pathname === '/app')
  );

  const toggleOpen = () => setIsOpen(!isOpen);
  const closePanel = () => setIsOpen(false);

  return (
    <div className="relative">
      <button
        data-testid={`tab-primary-${label.toLowerCase()}`}
        onClick={toggleOpen}
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
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        {label}
        {hasActiveTab && (
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />
        )}
      </button>
      
      <DropdownPanel
        label={label}
        tabs={tabs}
        pathname={pathname}
        isOpen={isOpen}
        onClose={closePanel}
        triggerId={triggerId}
        panelId={panelId}
      />
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
            triggerId="subnav-trigger-training"
            panelId="subnav-panel-training"
          />
          
          {/* Health Primary Tab */}
          <PrimaryTab 
            label="Health" 
            tabs={healthTabs} 
            pathname={pathname}
            triggerId="subnav-trigger-health"
            panelId="subnav-panel-health"
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
