import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures every route change immediately resets scroll position to the top of the page.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset window and document scroll position to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
    document.body.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
