import { useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';

export function useScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    void pathname;
    const el = document.querySelector<HTMLElement>('.wide-layout__content, .app-shell__content');
    el?.scrollTo({ top: 0 });
  }, [pathname]);
}
