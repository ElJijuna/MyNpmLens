import { Toolbar } from '@/components/Toolbar';
import { Route } from '@/routes/package.$name';
import { useNpmPackage, useRemoveFavorite } from '@/modules/npm/hooks';
import { useNavigate } from '@tanstack/react-router';
import { Dropdown, Text, Button, Icon } from '@gnome-ui/react';
import { Delete } from '@gnome-ui/icons';
import { PackageInfoSection } from './sections/PackageInfoSection';
import { DownloadsSection } from './sections/DownloadsSection';
import { BundleSizeSection } from './sections/BundleSizeSection';
import { GitHubSection } from './sections/GitHubSection';
import { VulnerabilitySection } from './sections/VulnerabilitySection';

export function PackageDetailPage() {
  const { name } = Route.useParams()
  const { version: searchVersion } = Route.useSearch()
  const { data: pkg } = useNpmPackage(name)
  const navigate = useNavigate()

  const version = searchVersion ?? pkg?.version ?? ''

  const versionOptions = (pkg?.versions ?? []).map((v) => {
    const tag = Object.entries(pkg?.distTags ?? {}).find(([, val]) => val === v)?.[0]
    return { value: v, label: tag ? `${v} (${tag})` : v }
  })

  const removeFavorite = useRemoveFavorite()

  function handleVersionChange(v: string) {
    void navigate({ to: '/package/$name', params: { name }, search: { version: v } })
  }

  function handleRemove() {
    removeFavorite.mutate(name, { onSuccess: () => navigate({ to: '/' }) })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Toolbar />

      <main className="page-content detail-sections">
        {versionOptions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Text variant="caption" color="dim" style={{ whiteSpace: 'nowrap' }}>Version</Text>
            <Dropdown
              aria-label="Select version"
              options={versionOptions}
              value={version || pkg?.version}
              onChange={handleVersionChange}
            />
            <Text variant="caption" color="dim" style={{ whiteSpace: 'nowrap' }}>
              {pkg?.versions.length} published
            </Text>
          </div>
        )}

        <PackageInfoSection name={name} version={version} />
        <DownloadsSection name={name} />
        <BundleSizeSection name={name} version={version} />
        <GitHubSection packageName={name} />
        <VulnerabilitySection packageName={name} version={version} />

        <Button variant="destructive" leadingIcon={<Icon icon={Delete} />} onClick={handleRemove}>
          Remove package
        </Button>
      </main>
    </div>
  )
}
