import { createContext, useContext, type ReactNode } from 'react'

interface SidebarContextValue {
  sidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
  sidebarCollapsed: boolean
  toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  sidebarOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  sidebarCollapsed: false,
  toggleCollapsed: () => {},
})

export function SidebarProvider({
  children,
  sidebarOpen,
  openSidebar,
  closeSidebar,
  sidebarCollapsed,
  toggleCollapsed,
}: {
  children: ReactNode
  sidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
  sidebarCollapsed: boolean
  toggleCollapsed: () => void
}) {
  return (
    <SidebarContext.Provider value={{ sidebarOpen, openSidebar, closeSidebar, sidebarCollapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext)
}
