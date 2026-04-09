import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { OfflineBanner } from '@/components/OfflineBanner'
import { AppFooter } from '@/components/AppFooter'
import '@/app.css';

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <OfflineBanner />
      <Outlet />
      <AppFooter />
    </>
  ),
})
