import { useEffect, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus inside `containerRef` when `active` is true.
 * - Focuses the first focusable child on activation.
 * - Tab / Shift+Tab cycle stays within the container.
 * - Focus is restored to the previously-focused element on deactivation.
 */
export const useFocusTrap = (containerRef: RefObject<HTMLElement | null>, active: boolean) => {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container  = containerRef.current;
    const previous   = document.activeElement as HTMLElement | null;

    // Focus first focusable element
    const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
    focusables[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.closest('[aria-hidden="true"]')
      );
      if (elements.length === 0) { e.preventDefault(); return; }

      const first = elements[0];
      const last  = elements[elements.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first) { e.preventDefault(); last.focus(); }
      } else {
        if (active === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previous?.focus();
    };
  }, [active, containerRef]);
};
