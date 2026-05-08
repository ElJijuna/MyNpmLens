import '@/lib/i18n'
import '@gnome-ui/core/styles'
import '@gnome-ui/react/styles'
import '@gnome-ui/charts/styles'
import '../node_modules/@gnome-ui/layout/dist/style.css'
import './styles/global.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { queryClient } from '@/lib/queryClient'
import { getDb } from '@/lib/db'
import { routeTree } from './routeTree.gen'
import { AuthProvider } from '@/modules/auth/AuthProvider'
import { GnomeLocaleProvider } from '@/components/GnomeLocaleProvider'

const db = await getDb()

const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => db.get('query-cache', key),
    setItem: (key, value) => db.put('query-cache', value, key),
    removeItem: (key) => db.delete('query-cache', key),
  },
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  basepath: import.meta.env.BASE_URL,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!

createRoot(rootElement).render(
  <StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 * 7 }}>
      <GnomeLocaleProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </GnomeLocaleProvider>
    </PersistQueryClientProvider>
  </StrictMode>,
)
