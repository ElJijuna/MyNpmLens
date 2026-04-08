/**
 * Centralised query key factory for all npm-related queries.
 * Using factory functions ensures type-safe cache invalidation.
 */
export const npmQueryKeys = {
  package: (name: string) => ['npm', 'package', name] as const,
  downloads: (name: string) => ['npm', 'downloads', name] as const,
  bundleSize: (name: string) => ['npm', 'bundleSize', name] as const,
}
