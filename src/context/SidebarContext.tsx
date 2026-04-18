import { createContext, useContext, type ReactNode } from 'react'

interface SidebarContextValue {
  openSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue>({ openSidebar: () => {} })

export function SidebarProvider({
  children,
  openSidebar,
}: {
  children: ReactNode
  openSidebar: () => void
}) {
  return (
    <SidebarContext.Provider value={{ openSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext)
}
