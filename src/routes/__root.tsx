import { useState } from 'react'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { OverlaySplitView, useBreakpoint } from '@gnome-ui/react'
import { OfflineBanner } from '@/components/OfflineBanner'
import { Toolbar } from '@/components/Toolbar'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/context/SidebarContext'
import { useGistSync } from '@/modules/gist/hooks'
import { MergeSyncDialog } from '@/modules/gist/components/MergeSyncDialog'
import { useApplyTheme } from '@/hooks/useApplyTheme'
import { useApplyLanguage } from '@/hooks/useApplyLanguage'
import { useApplyAccentColor } from '@/hooks/useApplyAccentColor'
import { usePageView } from '@/hooks/usePageView'
import '@/app.css'

interface RouterContext {
  queryClient: QueryClient
}

function RootLayout() {
  const { status, delta, resolveKeepAll, resolveReplaceWithLocal } = useGistSync()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isNarrow } = useBreakpoint()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth <= 860)
  useApplyTheme()
  useApplyLanguage()
  useApplyAccentColor()
  usePageView()

  return (
    <SidebarProvider
      sidebarOpen={sidebarOpen}
      openSidebar={() => setSidebarOpen(true)}
      closeSidebar={() => setSidebarOpen(false)}
      sidebarCollapsed={sidebarCollapsed}
      toggleCollapsed={() => setSidebarCollapsed((c) => !c)}
    >
      {isNarrow ? (
        <OverlaySplitView
          sidebar={<AppSidebar />}
          content={
            <>
              <OfflineBanner />
              <Toolbar />
              <Outlet />
            </>
          }
          showSidebar={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <div className="wide-layout">
          <AppSidebar />
          <div className="wide-layout__content">
            <OfflineBanner />
            <Toolbar />
            <Outlet />
          </div>
        </div>
      )}
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
