import { useState, useEffect } from 'react';

/**
 * Custom hook to subscribe to CSS media queries.
 * Safely defaults to desktop/SSR-friendly value until mounted in browser.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    const updateMatch = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches(e.matches);
    };

    setMatches(mediaQueryList.matches);

    // Modern browsers support addEventListener on MediaQueryList
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', updateMatch);
      return () => mediaQueryList.removeEventListener('change', updateMatch);
    } else {
      // Legacy fallback
      mediaQueryList.addListener(updateMatch);
      return () => mediaQueryList.removeListener(updateMatch);
    }
  }, [query]);

  return matches;
}

/**
 * Convenience hook for mobile viewport detection (< 768px, Tailwind's `md` breakpoint).
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767.98px)');
}

/**
 * Convenience hook for small mobile viewport detection (< 480px).
 */
export function useIsSmallMobile(): boolean {
  return useMediaQuery('(max-width: 479.98px)');
}
