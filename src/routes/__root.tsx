import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { OfflineBanner } from '@/components/OfflineBanner'
import '@/app.css';
import { Footer } from '@gnome-ui/react';

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <OfflineBanner />
      <Outlet />
      <Footer>@2025</Footer>
    </>
  ),
})
