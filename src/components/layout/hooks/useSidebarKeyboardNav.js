import { useState, useCallback } from 'react';

/**
 * Keyboard Navigation hook for HMS Sidebar.
 * - ArrowUp/ArrowDown: Moves active list highlighting index.
 * - ArrowRight: Expands folder menu.
 * - ArrowLeft: Collapses folder menu.
 * - Enter: Activates selection.
 */
export const useSidebarKeyboardNav = (isCollapsed, setActiveFlyout, setActiveSubFlyout) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleSidebarKeyDown = useCallback((e) => {
    if (isCollapsed) return;

    // Fetch all currently focusable/visible sidebar links
    const visibleElements = Array.from(
      document.querySelectorAll('.sidebar-menu-scroll a.sidebar-menu-link, .sidebar-menu-scroll div.sidebar-menu-link')
    );

    if (visibleElements.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev + 1 >= visibleElements.length ? 0 : prev + 1;
          visibleElements[next].focus();
          return next;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev - 1 < 0 ? visibleElements.length - 1 : prev - 1;
          visibleElements[next].focus();
          return next;
        });
        break;

      case 'ArrowRight': {
        e.preventDefault();
        const activeEl = document.activeElement;
        if (activeEl) {
          // Simulate clicking to expand accordion drawer
          const arrowIcon = activeEl.querySelector('svg');
          if (arrowIcon) {
            activeEl.click();
          }
        }
        break;
      }

      case 'ArrowLeft': {
        e.preventDefault();
        const activeEl = document.activeElement;
        if (activeEl) {
          // Simulate clicking to collapse accordion drawer
          const arrowIcon = activeEl.querySelector('svg');
          if (arrowIcon) {
            activeEl.click();
          }
        }
        break;
      }

      case 'Enter': {
        const activeEl = document.activeElement;
        if (activeEl) {
          activeEl.click();
        }
        break;
      }

      case 'Escape':
        e.preventDefault();
        const active = document.activeElement;
        if (active) active.blur();
        setFocusedIndex(-1);
        break;

      default:
        break;
    }
  }, [isCollapsed]);

  return { focusedIndex, handleSidebarKeyDown };
};

export default useSidebarKeyboardNav;
