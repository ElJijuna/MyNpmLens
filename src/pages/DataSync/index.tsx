import { useTranslation } from 'react-i18next'
import { PreferencesGroup } from '@gnome-ui/react/components/PreferencesGroup'
import { BoxedList } from '@gnome-ui/react/components/BoxedList'
import { ActionRow } from '@gnome-ui/react/components/ActionRow'
import { Box } from '@gnome-ui/react/components/Box'
import { Button } from '@gnome-ui/react/components/Button'
import { Badge } from '@gnome-ui/react/components/Badge'
import { useFavorites } from '@/modules/npm/hooks/useFavorites'
import { useMaintainers } from '@/modules/npm/hooks/useMaintainers'
import { useGistSync } from '@/modules/gist/hooks/useGistSync'
import { usePushToGist } from '@/modules/gist/hooks/usePushToGist'

export function DataSyncPage() {
  const { t } = useTranslation()
  const { data: localFavorites = [] } = useFavorites()
  const { data: localMaintainers = [] } = useMaintainers()
  const { delta, gistFavorites, gistMaintainers } = useGistSync()
  const pushToGist = usePushToGist()

  const allPackages = [
    ...localFavorites,
    ...gistFavorites.filter((g) => !localFavorites.find((l) => l.name === g.name)),
  ]

  const allMaintainers = [
    ...localMaintainers,
    ...gistMaintainers.filter((g) => !localMaintainers.find((l) => l.username === g.username)),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <main className="page-content">
        <Box spacing={16}>
          <PreferencesGroup title={t('sync.packagesGroup')}>
            <BoxedList>
              {allPackages.map((pkg) => {
                const isNew = delta.addedInGist.some((g) => g.name === pkg.name)
                const isOnlyLocal = delta.removedInGist.some((l) => l.name === pkg.name)
                return (
                  <ActionRow
                    key={pkg.name}
                    title={pkg.name}
                    trailing={
                      isNew ? (
                        <Badge variant="success">{t('sync.badgeNew')}</Badge>
                      ) : isOnlyLocal ? (
                        <Button
                          size="sm"
                          variant="outlined"
                          disabled={pushToGist.isPending}
                          onClick={() => pushToGist.mutate()}
                        >
                          {t('sync.saveToGist')}
                        </Button>
                      ) : undefined
                    }
                  />
                )
              })}
            </BoxedList>
          </PreferencesGroup>

          <PreferencesGroup title={t('sync.maintainersGroup')}>
            <BoxedList>
              {allMaintainers.map((m) => {
                const isNew = delta.addedMaintainersInGist.some((g) => g.username === m.username)
                const isOnlyLocal = delta.removedMaintainersInGist.some((l) => l.username === m.username)
                return (
                  <ActionRow
                    key={m.username}
                    title={m.username}
                    trailing={
                      isNew ? (
                        <Badge variant="success">{t('sync.badgeNew')}</Badge>
                      ) : isOnlyLocal ? (
                        <Button
                          size="sm"
                          variant="outlined"
                          disabled={pushToGist.isPending}
                          onClick={() => pushToGist.mutate()}
                        >
                          {t('sync.saveToGist')}
                        </Button>
                      ) : undefined
                    }
                  />
                )
              })}
            </BoxedList>
          </PreferencesGroup>
        </Box>
      </main>
    </div>
  )
}
