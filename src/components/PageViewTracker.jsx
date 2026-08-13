import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { captureEvent } from '../services/eventCaptureService';
import { EVENT_TYPES, PAGE_NAMES } from '../utils/events';
import { useAuth } from '../context/AuthContext';

// Maps a loan category route straight to its category key, so a single
// pageView event on these routes carries the category context — no
// separate categoryViewed event needed.
const CATEGORY_BY_PATH = {
  '/loans/home': 'Home',
  '/loans/land': 'Land',
  '/loans/vehicle': 'Vehicle',
  '/loans/commercial': 'Commercial',
};

/**
 * Fires a pageView event every time the route actually changes — including
 * client-side navigations via React Router, which don't trigger a browser
 * page load. Renders nothing.
 */
export default function PageViewTracker() {
  const location = useLocation();
  const { user } = useAuth();
  const lastPath = useRef(null);

  useEffect(() => {
    // Guard against firing twice for the same path (e.g. React StrictMode
    // double-invoking effects in development).
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;

    const pageName = PAGE_NAMES[location.pathname] || location.pathname;
    const category = CATEGORY_BY_PATH[location.pathname];

    captureEvent(EVENT_TYPES.PAGE_VIEW, {
      customerId: user?.customerId || 'anonymous',
      path: location.pathname,
      pageName,
      ...(category ? { category } : {}),
    });
  }, [location.pathname, user]);

  return null;
}
