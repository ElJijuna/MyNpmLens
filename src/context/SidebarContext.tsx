import { createContext, useContext, type ReactNode } from 'react'

interface SidebarContextValue {
  sidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
  sidebarOverlay: boolean
  sidebarCollapsed: boolean
  toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  sidebarOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  sidebarOverlay: false,
  sidebarCollapsed: false,
  toggleCollapsed: () => {},
})

export function SidebarProvider({
  children,
  sidebarOpen,
  openSidebar,
  closeSidebar,
  sidebarOverlay,
  sidebarCollapsed,
  toggleCollapsed,
}: {
  children: ReactNode
  sidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
  sidebarOverlay: boolean
  sidebarCollapsed: boolean
  toggleCollapsed: () => void
}) {
  return (
    <SidebarContext.Provider value={{ sidebarOpen, openSidebar, closeSidebar, sidebarOverlay, sidebarCollapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext)
}
