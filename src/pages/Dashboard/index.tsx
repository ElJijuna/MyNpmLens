import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Box, Button, Card, Icon, InlineViewSwitcher, InlineViewSwitcherItem, SearchBar, Spinner, StatusPage, Text, WrapBox } from '@gnome-ui/react'
import { Add, Applications, Star, ViewSidebar } from '@gnome-ui/icons'
import { DashboardGrid } from '@gnome-ui/layout/components/DashboardGrid'
import { AddPackageModal } from '@/components/AddPackageModal'
import { PackageCard } from '@/modules/npm/components/PackageCard'
import { AuthSection } from '@/modules/auth/components/AuthSection'
import { useFavorites, useMaintainers } from '@/modules/npm/hooks'
import { useNativeEvent } from '@gnome-ui/hooks'
import {
  useNpmBulkDownloads,
  useNpmTopByKeyword,
  useNpmTopByMaintenance,
  useNpmTopByPopularity,
  useNpmTopByQuality,
  useNpmTopByScope,
  useNpmTopPackages,
} from '@api-hooks/npm'
import { useFormatters } from '@/hooks/useFormatters'

type RankingView = 'top' | 'popularity' | 'quality' | 'maintenance'

export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { formatCompactNumber } = useFormatters()
  const [modalOpen, setModalOpen] = useState(false)
  const [rankingView, setRankingView] = useState<RankingView>('top')
  const [keyword, setKeyword] = useState('react')
  const [scope, setScope] = useState('@types')
  const { data: favorites = [] } = useFavorites()
  const { data: maintainers = [] } = useMaintainers()

  useNativeEvent('open-dialog-addpackage', () => setModalOpen(true))

  const packageNames = favorites.map((fav) => fav.name)
  const { data: favoriteDownloads } = useNpmBulkDownloads(packageNames, {
    period: 'last-week',
    enabled: packageNames.length > 0,
  })
  const topPackages = useNpmTopPackages({ n: 6, enabled: rankingView === 'top' })
  const popularPackages = useNpmTopByPopularity({ n: 6, enabled: rankingView === 'popularity' })
  const qualityPackages = useNpmTopByQuality({ n: 6, enabled: rankingView === 'quality' })
  const maintenancePackages = useNpmTopByMaintenance({ n: 6, enabled: rankingView === 'maintenance' })
  const keywordPackages = useNpmTopByKeyword(keyword, { n: 4, enabled: keyword.trim().length > 0 })
  const scopePackages = useNpmTopByScope(scope, { n: 4, enabled: scope.trim().length > 0 })

  const rankingData = {
    top: topPackages.data,
    popularity: popularPackages.data,
    quality: qualityPackages.data,
    maintenance: maintenancePackages.data,
  }[rankingView]
  const rankingIsLoading = {
    top: topPackages.isPending,
    popularity: popularPackages.isPending,
    quality: qualityPackages.isPending,
    maintenance: maintenancePackages.isPending,
  }[rankingView]

  const weeklyDownloads = Object.values(favoriteDownloads ?? {}).reduce(
    (total, item) => total + (item?.downloads ?? 0),
    0,
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <main className="page-content">
        <Box spacing={24}>
          <WrapBox justify="space-between" align="center">
            <Box spacing={12}>
              <Text variant="heading">{t('dashboard.title')}</Text>
              <Text color="dim">{t('dashboard.description')}</Text>
            </Box>
            <WrapBox childSpacing={8} align="center">
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate({ to: '/favorites' })}
                leadingIcon={<Icon icon={Star} />}
              >
                {t('dashboard.viewFavorites')}
              </Button>
              <Button
                variant="suggested"
                size="sm"
                onClick={() => setModalOpen(true)}
                leadingIcon={<Icon icon={Add} />}
              >
                {t('dashboard.add')}
              </Button>
            </WrapBox>
          </WrapBox>

          <DashboardGrid layout="grid" columns={{ sm: 1, md: 3 }} gap="md">
            <DashboardGrid.Item>
              <MetricCard label={t('dashboard.favoritePackages')} value={favorites.length} />
            </DashboardGrid.Item>
            <DashboardGrid.Item>
              <MetricCard label={t('dashboard.followedMaintainers')} value={maintainers.length} />
            </DashboardGrid.Item>
            <DashboardGrid.Item>
              <MetricCard label={t('dashboard.weeklyDownloads')} value={formatCompactNumber(weeklyDownloads)} />
            </DashboardGrid.Item>
          </DashboardGrid>

          <Box spacing={12}>
            <div className="dashboard-discover-header">
              <Text variant="heading">{t('dashboard.discover')}</Text>
              <InlineViewSwitcher
                className="dashboard-ranking-switcher"
                value={rankingView}
                onValueChange={(value) => setRankingView(value as RankingView)}
                variant="pill"
                aria-label={t('dashboard.ranking')}
              >
                <InlineViewSwitcherItem name="top" label={t('dashboard.topPackages')} icon={Applications} />
                <InlineViewSwitcherItem name="popularity" label={t('dashboard.popularity')} icon={Star} />
                <InlineViewSwitcherItem name="quality" label={t('dashboard.quality')} icon={Applications} />
                <InlineViewSwitcherItem name="maintenance" label={t('dashboard.maintenance')} icon={ViewSidebar} />
              </InlineViewSwitcher>
            </div>
            <PackageGrid
              names={(rankingData?.objects ?? []).map((item) => item.package.name)}
              isLoading={rankingIsLoading}
              emptyTitle={t('dashboard.emptyPackagesTitle')}
              emptyDescription={t('dashboard.emptyPackagesDescription')}
            />
          </Box>

          <DashboardGrid layout="grid" columns="auto" gap="md">
            <DashboardGrid.Item>
              <Box spacing={12}>
                <Text variant="heading">{t('dashboard.byKeyword')}</Text>
                <SearchBar
                  inline
                  open
                  value={keyword}
                  placeholder={t('dashboard.keywordPlaceholder')}
                  onChange={(event) => setKeyword(event.target.value)}
                  onClear={() => setKeyword('')}
                  autoCapitalize="none"
                />
                <PackageGrid
                  names={(keywordPackages.data?.objects ?? []).map((item) => item.package.name)}
                  isLoading={keywordPackages.isPending}
                  emptyTitle={t('dashboard.emptyPackagesTitle')}
                  emptyDescription={t('dashboard.emptyPackagesDescription')}
                />
              </Box>
            </DashboardGrid.Item>
            <DashboardGrid.Item>
              <Box spacing={12}>
                <Text variant="heading">{t('dashboard.byScope')}</Text>
                <SearchBar
                  inline
                  open
                  value={scope}
                  placeholder={t('dashboard.scopePlaceholder')}
                  onChange={(event) => setScope(event.target.value)}
                  onClear={() => setScope('')}
                  autoCapitalize="none"
                />
                <PackageGrid
                  names={(scopePackages.data?.objects ?? []).map((item) => item.package.name)}
                  isLoading={scopePackages.isPending}
                  emptyTitle={t('dashboard.emptyPackagesTitle')}
                  emptyDescription={t('dashboard.emptyPackagesDescription')}
                />
              </Box>
            </DashboardGrid.Item>
          </DashboardGrid>
        </Box>
        <AuthSection />
      </main>

      <AddPackageModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card padding="md">
      <Text variant="caption" color="dim">
        {label}
      </Text>
      <Text variant="title-2">{value}</Text>
    </Card>
  )
}

function PackageGrid({
  names,
  isLoading,
  emptyTitle,
  emptyDescription,
}: {
  names: string[]
  isLoading: boolean
  emptyTitle: string
  emptyDescription: string
}) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
        <Spinner size="md" />
      </div>
    )
  }

  if (names.length === 0) {
    return (
      <StatusPage
        compact
        icon={Applications}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <DashboardGrid layout="grid" columns={{ sm: 1, md: 2 }} gap="sm">
      {names.map((name) => (
        <DashboardGrid.Item key={name}>
          <PackageCard name={name} />
        </DashboardGrid.Item>
      ))}
    </DashboardGrid>
  )
}
