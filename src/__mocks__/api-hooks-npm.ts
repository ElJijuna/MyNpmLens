import type { ReactNode } from 'react';

const defaultQuery = { data: undefined, isLoading: false, isError: false, isPending: false };

export const useNpmPackage = jest.fn(() => defaultQuery);
export const useNpmPackageVersion = jest.fn(() => defaultQuery);
export const useNpmPackageLatest = jest.fn(() => defaultQuery);
export const useNpmPackageVersions = jest.fn(() => defaultQuery);
export const useNpmPackageDistTags = jest.fn(() => defaultQuery);
export const useNpmPackageMaintainers = jest.fn(() => defaultQuery);
export const useNpmPackageDownloads = jest.fn(() => defaultQuery);
export const useNpmPackageVersionDownloads = jest.fn(() => defaultQuery);
export const useNpmPackageDownloadRange = jest.fn(() => defaultQuery);
export const useNpmPackageSize = jest.fn(() => defaultQuery);
export const useNpmPackageCdnStats = jest.fn(() => defaultQuery);
export const useNpmPackageVersionSize = jest.fn(() => defaultQuery);
export const useNpmPackageVersionFiles = jest.fn(() => defaultQuery);
export const useNpmPackageVersionCdnStats = jest.fn(() => defaultQuery);
export const useNpmPackageVersionDependencies = jest.fn(() => defaultQuery);
export const useNpmBulkDownloads = jest.fn(() => defaultQuery);
export const useNpmAudit = jest.fn(() => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  data: undefined,
  isPending: false,
}));
export const useNpmAuditQuick = jest.fn(() => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  data: undefined,
  isPending: false,
}));
export const useNpmMaintainer = jest.fn(() => defaultQuery);
export const useNpmMaintainerPackages = jest.fn(() => defaultQuery);
export const useNpmMaintainerAvatar = jest.fn(() => ({
  ...defaultQuery,
  data: 'https://www.npmjs.com/npm-avatar/test',
}));
export const useNpmPackageScore = jest.fn(() => defaultQuery);
export const useNpmSearch = jest.fn(() => defaultQuery);
export const useNpmTopPackages = jest.fn(() => defaultQuery);
export const useNpmTopByPopularity = jest.fn(() => defaultQuery);
export const useNpmTopByQuality = jest.fn(() => defaultQuery);
export const useNpmTopByMaintenance = jest.fn(() => defaultQuery);
export const useNpmTopByKeyword = jest.fn(() => defaultQuery);
export const useNpmTopByScope = jest.fn(() => defaultQuery);
export const useNpmOrgPackages = jest.fn(() => defaultQuery);
export const useNpmOrgTeams = jest.fn(() => defaultQuery);
export const useNpmOrgMembers = jest.fn(() => defaultQuery);
export const useNpmOrgTeamMembers = jest.fn(() => defaultQuery);
export const useNpmWhoami = jest.fn(() => defaultQuery);
export const useNpmClient = jest.fn(() => ({
  package: jest.fn(() => ({
    get: jest.fn(),
    downloads: jest.fn(),
  })),
  maintainer: jest.fn(() => ({
    packages: jest.fn(),
  })),
}));
export function NpmClientProvider({ children }: { children: ReactNode }) {
  return children;
}
export const npmQueryKeys = {
  package: (name: string) => ['npm', 'package', name] as const,
  packageVersion: (name: string, version: string) =>
    ['npm', 'package', name, 'version', version] as const,
  packageVersions: (name: string) => ['npm', 'package', name, 'versions'] as const,
  packageDistTags: (name: string) => ['npm', 'package', name, 'dist-tags'] as const,
  packageMaintainers: (name: string) => ['npm', 'package', name, 'maintainers'] as const,
  packageDownloads: (name: string, period: string) =>
    ['npm', 'package', name, 'downloads', period] as const,
  packageVersionDownloads: (name: string, version: string, period: string) =>
    ['npm', 'package', name, 'version', version, 'downloads', period] as const,
  packageDownloadRange: (name: string, period: string) =>
    ['npm', 'package', name, 'download-range', period] as const,
  packageScore: (name: string) => ['npm', 'package', name, 'score'] as const,
  packageSize: (name: string) => ['npm', 'package', name, 'size'] as const,
  packageCdnStats: (name: string, groupBy: string, period: string) =>
    ['npm', 'package', name, 'cdn-stats', groupBy, period] as const,
  packageVersionSize: (name: string, version: string) =>
    ['npm', 'package', name, 'version', version, 'size'] as const,
  packageVersionFiles: (name: string, version: string) =>
    ['npm', 'package', name, 'version', version, 'files'] as const,
  packageVersionCdnStats: (name: string, version: string, groupBy: string, period: string) =>
    ['npm', 'package', name, 'version', version, 'cdn-stats', groupBy, period] as const,
  packageVersionDependencies: (name: string, version: string) =>
    ['npm', 'package', name, 'version', version, 'dependencies'] as const,
  bulkDownloads: (packages: string[], period: string) =>
    ['npm', 'bulk-downloads', packages, period] as const,
  maintainer: (username: string) => ['npm', 'maintainer', username] as const,
  maintainerPackages: (username: string, params?: object) =>
    ['npm', 'maintainer', username, 'packages', params] as const,
  maintainerAvatar: (username: string) => ['npm', 'maintainer', username, 'avatar'] as const,
  search: (params: object) => ['npm', 'search', params] as const,
  topPackages: (n: number) => ['npm', 'top-packages', n] as const,
  topByPopularity: (n: number) => ['npm', 'top-by-popularity', n] as const,
  topByQuality: (n: number) => ['npm', 'top-by-quality', n] as const,
  topByMaintenance: (n: number) => ['npm', 'top-by-maintenance', n] as const,
  topByKeyword: (keyword: string, n: number) => ['npm', 'top-by-keyword', keyword, n] as const,
  topByScope: (scope: string, n: number) => ['npm', 'top-by-scope', scope, n] as const,
  orgPackages: (org: string) => ['npm', 'org', org, 'packages'] as const,
  orgTeams: (org: string) => ['npm', 'org', org, 'teams'] as const,
  orgMembers: (org: string) => ['npm', 'org', org, 'members'] as const,
  orgTeamMembers: (org: string, team: string) =>
    ['npm', 'org', org, 'team', team, 'members'] as const,
  whoami: () => ['npm', 'whoami'] as const,
};
