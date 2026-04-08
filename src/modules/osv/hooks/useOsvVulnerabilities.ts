import { useQuery } from '@tanstack/react-query'
import { fetchOsvVulnerabilities } from '../proxy/fetchOsvVulnerabilities'

const osvQueryKeys = {
  vulnerabilities: (name: string, version: string) =>
    ['osv', 'vulnerabilities', name, version] as const,
}

export function useOsvVulnerabilities(packageName: string, packageVersion: string) {
  return useQuery({
    queryKey: osvQueryKeys.vulnerabilities(packageName, packageVersion),
    queryFn: () => fetchOsvVulnerabilities(packageName, packageVersion),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    enabled: packageName.length > 0 && packageVersion.length > 0,
  })
}
