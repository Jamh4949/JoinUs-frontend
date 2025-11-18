/**
 * ScrollToTop Component
 *
 * This component automatically scrolls the window to the top
 * when the user navigates to a different route. It also moves
 * focus to the main content for screen reader accessibility.
 *
 * Features:
 * - Instant scroll to top on route change
 * - Focus management for screen readers
 * - Accessibility-first approach
 *
 * @component
 * @module ScrollToTop
 */

import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that handles automatic scrolling on navigation
 *
 * Uses a ref to track the previous pathname and only scrolls
 * when the route actually changes, preventing unnecessary scrolls
 * on component re-renders.
 *
 * @returns {null} This component doesn't render any visible UI
 */
const ScrollToTop: FC = () => {
  const { pathname } = useLocation();
  const previousPathname = useRef<string>(pathname);

  useEffect((): void => {
    // Only scroll if the pathname has actually changed
    if (previousPathname.current !== pathname) {
      // Scroll to top of page instantly
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' as ScrollBehavior,
      });

      // Move focus to main content for screen readers (WCAG 2.1)
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
      }

      // Update the ref with the new pathname
      previousPathname.current = pathname;
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
