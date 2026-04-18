import { useState } from 'react'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { OverlaySplitView } from '@gnome-ui/react'
import { OfflineBanner } from '@/components/OfflineBanner'
import { AppSidebar } from '@/components/AppSidebar'
import { useGistSync } from '@/modules/gist/hooks'
import { MergeSyncDialog } from '@/modules/gist/components/MergeSyncDialog'
import '@/app.css'

interface RouterContext {
  queryClient: QueryClient
}

function RootLayout() {
  const { status, delta, resolveKeepAll, resolveReplaceWithLocal } = useGistSync()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <OverlaySplitView
        sidebar={<AppSidebar />}
        content={
          <>
            <OfflineBanner />
            <Outlet />
          </>
        }
        showSidebar={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
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
