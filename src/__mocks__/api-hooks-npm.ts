const defaultQuery = { data: undefined, isLoading: false, isError: false, isPending: false }

export const useNpmPackage = jest.fn(() => defaultQuery)
export const useNpmPackageVersion = jest.fn(() => defaultQuery)
export const useNpmPackageLatest = jest.fn(() => defaultQuery)
export const useNpmPackageVersions = jest.fn(() => defaultQuery)
export const useNpmPackageDistTags = jest.fn(() => defaultQuery)
export const useNpmPackageMaintainers = jest.fn(() => defaultQuery)
export const useNpmPackageDownloads = jest.fn(() => defaultQuery)
export const useNpmPackageVersionDownloads = jest.fn(() => defaultQuery)
export const useNpmPackageDownloadRange = jest.fn(() => defaultQuery)
export const useNpmMaintainer = jest.fn(() => defaultQuery)
export const useNpmMaintainerPackages = jest.fn(() => defaultQuery)
export const useNpmMaintainerAvatar = jest.fn(() => 'https://www.npmjs.com/npm-avatar/test')
export const useNpmPackageScore = jest.fn(() => defaultQuery)
export const useNpmSearch = jest.fn(() => defaultQuery)
export const npmQueryKeys = {
  package: (name: string) => ['npm', 'package', name] as const,
  packageVersion: (name: string, version: string) => ['npm', 'package', name, 'version', version] as const,
  packageVersions: (name: string) => ['npm', 'package', name, 'versions'] as const,
  packageDistTags: (name: string) => ['npm', 'package', name, 'dist-tags'] as const,
  packageMaintainers: (name: string) => ['npm', 'package', name, 'maintainers'] as const,
  packageDownloads: (name: string, period: string) => ['npm', 'package', name, 'downloads', period] as const,
  packageVersionDownloads: (name: string, version: string, period: string) => ['npm', 'package', name, 'version', version, 'downloads', period] as const,
  packageDownloadRange: (name: string, period: string) => ['npm', 'package', name, 'download-range', period] as const,
  maintainer: (username: string) => ['npm', 'maintainer', username] as const,
  maintainerPackages: (username: string, params?: object) => ['npm', 'maintainer', username, 'packages', params] as const,
  search: (params: object) => ['npm', 'search', params] as const,
}
