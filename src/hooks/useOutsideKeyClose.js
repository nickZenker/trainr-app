'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook for handling outside clicks, escape key, and route changes to close dropdowns
 * @param {boolean} isOpen - Whether the dropdown is currently open
 * @param {function} onClose - Function to call when closing
 * @param {boolean} enableRouteClose - Whether to close on route changes (default: true)
 * @returns {object} - { ref: RefObject, handleKeyDown: function }
 */
export function useOutsideKeyClose(isOpen, onClose, enableRouteClose = true) {
  const ref = useRef(null);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    if (enableRouteClose && isOpen) {
      onClose();
    }
  }, [pathname, isOpen, onClose, enableRouteClose]);

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (isOpen && ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape' && isOpen) {
      onClose();
      // Return focus to trigger button
      const trigger = ref.current?.querySelector('[data-testid*="subnav-trigger"]');
      if (trigger) {
        trigger.focus();
      }
    }
  }, [isOpen, onClose]);

  return { ref, handleKeyDown };
}
