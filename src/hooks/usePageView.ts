import { useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Analytics } from '@/lib/analytics';

export function usePageView() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    Analytics.pageView(pathname);
  }, [pathname]);
}
