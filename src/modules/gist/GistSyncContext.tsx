import { createContext, useContext } from 'react'

type SyncStatus = 'idle' | 'syncing' | 'conflict' | 'done' | 'error'

interface GistSyncContextValue {
  status: SyncStatus
}

export const GistSyncContext = createContext<GistSyncContextValue>({ status: 'idle' })

export function useGistSyncStatus(): SyncStatus {
  return useContext(GistSyncContext).status
}
