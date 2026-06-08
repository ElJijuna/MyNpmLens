import { useEffect, useState } from 'react'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
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
import { useScrollToTop } from '@/hooks/useScrollToTop'
import '@/app.css'

interface RouterContext {
  queryClient: QueryClient
}

const SIDEBAR_OVERLAY_QUERY = '(max-width: 860px)'

function getSidebarOverlay() {
  return window.matchMedia(SIDEBAR_OVERLAY_QUERY).matches
}

function RootLayout() {
  const { status, delta, resolveKeepAll, resolveReplaceWithLocal } = useGistSync()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarOverlay, setSidebarOverlay] = useState(getSidebarOverlay)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getSidebarOverlay)
  useApplyTheme()
  useApplyLanguage()
  useApplyAccentColor()
  usePageView()
  useScrollToTop()

  useEffect(() => {
    const media = window.matchMedia(SIDEBAR_OVERLAY_QUERY)
    const updateSidebarMode = () => {
      const isOverlay = media.matches
      setSidebarOverlay(isOverlay)
      if (!isOverlay) setSidebarOpen(false)
    }

    updateSidebarMode()
    media.addEventListener('change', updateSidebarMode)
    return () => media.removeEventListener('change', updateSidebarMode)
  }, [])

  useEffect(() => {
    if (!sidebarOverlay || !sidebarOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false)
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [sidebarOpen, sidebarOverlay])

  const appContent = (
    <>
      <OfflineBanner />
      <Toolbar />
      <Outlet />
    </>
  )

  return (
    <SidebarProvider
      sidebarOpen={sidebarOpen}
      openSidebar={() => setSidebarOpen(true)}
      closeSidebar={() => setSidebarOpen(false)}
      sidebarOverlay={sidebarOverlay}
      sidebarCollapsed={sidebarCollapsed}
      toggleCollapsed={() => setSidebarCollapsed((c) => !c)}
    >
      {sidebarOverlay ? (
        <div className="app-shell app-shell--overlay" data-sidebar-open={sidebarOpen}>
          <div className="app-shell__content">{appContent}</div>
          <button type="button" className="app-shell__backdrop" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} />
          <aside className="app-shell__sidebar" aria-hidden={!sidebarOpen}>
            <AppSidebar />
          </aside>
        </div>
      ) : (
        <div className="wide-layout">
          <AppSidebar />
          <div className="wide-layout__content">{appContent}</div>
        </div>
      )}
      {status === 'conflict' && <MergeSyncDialog delta={delta} onKeepAll={resolveKeepAll} onReplaceWithLocal={resolveReplaceWithLocal} />}
    </SidebarProvider>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})
