import '@/lib/i18n';
import '@gnome-ui/core/styles';
import '@gnome-ui/react/styles';
import '@gnome-ui/charts/styles';
import '../node_modules/@gnome-ui/layout/dist/style.css';
import './styles/global.css';
import { ToastProvider } from '@gnome-ui/layout/components/Toast';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GnomeLocaleProvider } from '@/components/GnomeLocaleProvider';
import { getDb } from '@/lib/db';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/modules/auth/AuthProvider';
import { NpmAuthProvider } from '@/modules/npm/NpmAuthProvider';
import { routeTree } from './routeTree.gen';

const db = await getDb();

const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => db.get('query-cache', key),
    setItem: (key, value) => db.put('query-cache', value, key),
    removeItem: (key) => db.delete('query-cache', key),
  },
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  basepath: import.meta.env.BASE_URL,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 * 7 }}
    >
      <NpmAuthProvider>
        <GnomeLocaleProvider>
          <ToastProvider>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </ToastProvider>
        </GnomeLocaleProvider>
      </NpmAuthProvider>
    </PersistQueryClientProvider>
  </StrictMode>,
);
