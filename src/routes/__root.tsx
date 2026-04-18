import { useState } from 'react'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { OverlaySplitView } from '@gnome-ui/react'
import { OfflineBanner } from '@/components/OfflineBanner'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/context/SidebarContext'
import { useGistSync } from '@/modules/gist/hooks'
import { MergeSyncDialog } from '@/modules/gist/components/MergeSyncDialog'
import { useApplyTheme } from '@/hooks/useApplyTheme'
import '@/app.css'

interface RouterContext {
  queryClient: QueryClient
}

function RootLayout() {
  const { status, delta, resolveKeepAll, resolveReplaceWithLocal } = useGistSync()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useApplyTheme()

  return (
    <SidebarProvider openSidebar={() => setSidebarOpen(true)}>
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
    </SidebarProvider>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})
