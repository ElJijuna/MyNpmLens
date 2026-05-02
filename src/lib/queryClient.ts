import { QueryClient } from '@tanstack/react-query'

const PERSISTED_QUERY_PREFIXES = ['gh', 'github', 'npm', 'bp', 'osv']

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24 * 7,
      networkMode: 'offlineFirst',
      retry: 2,
    },
    dehydrate: {
      shouldDehydrateQuery: (query) => {
        const [prefix, subtype] = query.queryKey as string[]
        if (!PERSISTED_QUERY_PREFIXES.includes(prefix)) return false
        if (prefix === 'npm' && subtype === 'search') return false
        return true
      },
    },
  },
})
