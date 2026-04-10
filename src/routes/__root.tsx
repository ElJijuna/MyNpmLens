import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { OfflineBanner } from '@/components/OfflineBanner'
import { AppFooter } from '@/components/AppFooter'
import { useGistSync } from '@/modules/gist/hooks'
import { MergeSyncDialog } from '@/modules/gist/components/MergeSyncDialog'
import '@/app.css'

interface RouterContext {
  queryClient: QueryClient
}

function RootLayout() {
  const { status, delta, resolveKeepAll, resolveReplaceWithLocal } = useGistSync()

  return (
    <>
      <OfflineBanner />
      <Outlet />
      <AppFooter />
      {status === 'conflict' && (
        <MergeSyncDialog
          delta={delta}
          onKeepAll={resolveKeepAll}
          onReplaceWithLocal={resolveReplaceWithLocal}
        />
      )}
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})
