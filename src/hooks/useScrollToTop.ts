import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'

export function useScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.wide-layout__content, .app-shell__content')
    el?.scrollTo({ top: 0 })
  }, [pathname])
}
