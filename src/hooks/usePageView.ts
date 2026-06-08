import { useRouterState } from '@tanstack/react-router';
import { logEvent } from 'firebase/analytics';
import { useEffect } from 'react';
import { analytics } from '@/modules/auth/proxy/firebase';

export function usePageView() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'page_view', { page_path: pathname });
    }
  }, [pathname]);
}
