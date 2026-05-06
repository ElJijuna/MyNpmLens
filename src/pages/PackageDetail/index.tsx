import { useTranslation } from 'react-i18next'
import { Route } from '@/routes/packages.$name';
import { useRemoveFavorite, useAddFavorite, useFavorites } from '@/modules/npm/hooks';
import { useNpmPackage } from '@api-hooks/npm';
import { useNavigate } from '@tanstack/react-router';
import { Dropdown, Text, Button, Icon, Box } from '@gnome-ui/react';
import { Delete, StarOutline } from '@gnome-ui/icons';
import { DashboardGrid } from '@gnome-ui/layout/components/DashboardGrid';
import { PackageInfoSection } from './sections/PackageInfoSection';
import { DownloadsSection } from './sections/DownloadsSection';
import { BundleSizeSection } from './sections/BundleSizeSection';
import { GitHubSection } from './sections/GitHubSection';
import { VulnerabilitySection } from './sections/VulnerabilitySection';
import { ScoreSection } from './sections/ScoreSection';

export function PackageDetailPage() {
  const { t } = useTranslation()
  const { name } = Route.useParams()
  const { version: searchVersion, fromMaintainer } = Route.useSearch()
  const { data: pkg } = useNpmPackage(name)
  const { data: favorites = [] } = useFavorites()
  const navigate = useNavigate()

  const latestVersion = pkg?.['dist-tags']?.latest ?? ''
  const version = searchVersion ?? latestVersion

  const versionList = pkg ? Object.keys(pkg.versions).reverse() : []
  const versionOptions = versionList.map((v) => {
    const tag = Object.entries(pkg?.['dist-tags'] ?? {}).find(([, val]) => val === v)?.[0]
    return { value: v, label: tag ? `${v} (${tag})` : v }
  })

  const isFavorite = favorites.some((f) => f.name === name)
  const removeFavorite = useRemoveFavorite()
  const addFavorite = useAddFavorite()

  function handleVersionChange(v: string) {
    void navigate({ to: '/packages/$name', params: { name }, search: { version: v, fromMaintainer } })
  }

  function handleRemove() {
    removeFavorite.mutate(name, { onSuccess: () => navigate({ to: '/' }) })
  }

  function handleAdd() {
    addFavorite.mutate(name, { onSuccess: () => navigate({ to: '/' }) })
  }

  const actionButton = fromMaintainer
    ? isFavorite
      ? (
        <Button variant="destructive" leadingIcon={<Icon icon={Delete} />} onClick={handleRemove}>
          {t('packageDetail.removePackage')}
        </Button>
      )
      : (
        <Button variant="suggested" leadingIcon={<Icon icon={StarOutline} />} onClick={handleAdd} disabled={addFavorite.isPending}>
          {t('packageDetail.addPackage')}
        </Button>
      )
    : (
      <Button variant="destructive" leadingIcon={<Icon icon={Delete} />} onClick={handleRemove}>
        {t('packageDetail.removePackage')}
      </Button>
    )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <main className="page-content">
        <Box spacing={16}>
          {versionOptions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Text variant="caption" color="dim" style={{ whiteSpace: 'nowrap' }}>{t('packageDetail.version')}</Text>
              <Dropdown
                aria-label={t('packageDetail.selectVersion')}
                options={versionOptions}
                value={version || latestVersion}
                onChange={handleVersionChange}
              />
              <Text variant="caption" color="dim" style={{ whiteSpace: 'nowrap' }}>
                {versionList.length} {t('packageDetail.published')}
              </Text>
            </div>
          )}

          <DashboardGrid columns={{ sm: 1, md: 2 }} gap="md">
            <DashboardGrid.Item span={2}>
              <PackageInfoSection name={name} version={version} />
            </DashboardGrid.Item>
            <DashboardGrid.Item span={1}>
              <ScoreSection name={name} />
            </DashboardGrid.Item>
            <DashboardGrid.Item span={1}>
              <DownloadsSection name={name} version={version} />
            </DashboardGrid.Item>
            <DashboardGrid.Item span={1}>
              <BundleSizeSection name={name} version={version} />
            </DashboardGrid.Item>
            <DashboardGrid.Item span={1}>
              <GitHubSection packageName={name} />
            </DashboardGrid.Item>
            <DashboardGrid.Item span={2}>
              <VulnerabilitySection packageName={name} version={version} />
            </DashboardGrid.Item>
          </DashboardGrid>

          {actionButton}
        </Box>
      </main>
    </div>
  )
}
