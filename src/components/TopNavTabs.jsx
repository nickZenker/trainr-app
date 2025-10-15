'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
        text-sm md:text-base font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full px-2 md:px-3 py-1 transition-colors duration-200
        ${isActive 
          ? 'text-brand' 
          : 'text-text-muted hover:text-foreground'
        }
      `}
      role="menuitem"
      tabIndex={-1}
    >
      {tab.label}
    </Link>
  );
}

function MegaDropdownPanel({ label, tabs, pathname, isOpen, onClose, triggerId, panelId }) {
  const { ref, handleKeyDown } = useOutsideKeyClose(isOpen, onClose);
  const menuRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Portal mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect desktop vs mobile
  useEffect(() => {
    const checkPointer = () => {
      setIsDesktop(window.matchMedia('(pointer: fine)').matches);
    };
    
    checkPointer();
    window.addEventListener('resize', checkPointer);
    return () => window.removeEventListener('resize', checkPointer);
  }, []);

  // Panel mouse events to prevent closing when hovering
  const handlePanelMouseEnter = () => {
    if (isDesktop) {
      // Cancel any pending close timers from trigger
      const trigger = document.querySelector(`[data-testid="${triggerId}"]`);
      if (trigger && trigger._leaveTimeoutRef) {
        clearTimeout(trigger._leaveTimeoutRef);
        trigger._leaveTimeoutRef = null;
      }
    }
  };

  const handlePanelMouseLeave = (event) => {
    if (isDesktop) {
      // Check if mouse is moving back to trigger
      const relatedTarget = event.relatedTarget;
      const trigger = document.querySelector(`[data-testid="${triggerId}"]`);
      
      if (relatedTarget && trigger && (
        trigger.contains(relatedTarget) || 
        relatedTarget.closest(`[data-testid="${triggerId}"]`)
      )) {
        // Mouse is moving back to trigger, don't close
        return;
      }
      
      // Close panel after delay
      setTimeout(() => {
        onClose();
      }, 200);
    }
  };

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

  if (!isOpen || !mounted) return null;

  const megamenuRoot = document.getElementById('megamenu-root');
  if (!megamenuRoot) return null;

  return createPortal(
    <div
      ref={ref}
      data-testid={panelId}
      className="absolute left-0 right-0 top-full z-50 p-2 md:p-3 pointer-events-auto"
      role="menu"
      onKeyDown={handleMenuKeyDown}
      onMouseEnter={handlePanelMouseEnter}
      onMouseLeave={handlePanelMouseLeave}
    >
      <nav 
        ref={menuRef}
        className="flex flex-wrap items-center gap-3 md:gap-4 px-2 md:px-0"
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
      </nav>
    </div>,
    megamenuRoot
  );
}

function PrimaryTab({ label, tabs, pathname, triggerId, panelId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const leaveTimeoutRef = useRef(null);
  const triggerRef = useRef(null);

  const hasActiveTab = tabs.some(tab => 
    pathname === tab.href || 
    (tab.href !== '/app' && pathname.startsWith(tab.href)) ||
    (tab.href === '/app' && pathname === '/app')
  );

  // Detect desktop vs mobile
  useEffect(() => {
    const checkPointer = () => {
      setIsDesktop(window.matchMedia('(pointer: fine)').matches);
    };
    
    checkPointer();
    window.addEventListener('resize', checkPointer);
    return () => window.removeEventListener('resize', checkPointer);
  }, []);

  const openPanel = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const closePanel = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsOpen(false);
  };

  const handleMouseEnter = () => {
    if (isDesktop) {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
        leaveTimeoutRef.current = null;
      }
      hoverTimeoutRef.current = setTimeout(openPanel, 150);
    }
  };

  const handleMouseLeave = (event) => {
    if (isDesktop) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      
      // Check if mouse is moving to panel or related element
      const relatedTarget = event.relatedTarget;
      const panel = document.querySelector(`[data-testid="${panelId}"]`);
      
      if (relatedTarget && panel && (
        panel.contains(relatedTarget) || 
        relatedTarget.closest(`[data-testid="${panelId}"]`)
      )) {
        // Mouse is moving to panel, don't close
        return;
      }
      
      leaveTimeoutRef.current = setTimeout(closePanel, 200);
      // Store reference on trigger element for panel to access
      if (triggerRef.current) {
        triggerRef.current._leaveTimeoutRef = leaveTimeoutRef.current;
      }
    }
  };

  const handleClick = () => {
    if (!isDesktop) {
      setIsOpen(!isOpen);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isDesktop) {
        setIsOpen(!isOpen);
      } else {
        openPanel();
      }
    }
  };

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        data-testid={triggerId}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
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
      
      <MegaDropdownPanel
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
      className="relative" 
      data-testid="topnav-home"
      role="tablist"
    >
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
    </nav>
  );
}
