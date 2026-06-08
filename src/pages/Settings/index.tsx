import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useNpmWhoami } from '@api-hooks/npm'
import { PreferencesGroup, BoxedList, ComboRow, ActionRow, ColorPicker, Box, Button, Link, PasswordEntryRow, Text } from '@gnome-ui/react'
import { useSettings, useUpdateSettings } from '@/modules/settings/hooks'
import { DEFAULT_SETTINGS } from '@/modules/settings/domain'
import { useNpmAuth } from '@/modules/npm/NpmAuthProvider'

export function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: settings = DEFAULT_SETTINGS } = useSettings()
  const updateSettings = useUpdateSettings()
  const { npmToken, hasNpmToken, setNpmToken, clearNpmToken } = useNpmAuth()
  const [npmTokenDraft, setNpmTokenDraft] = useState('')
  const trimmedNpmToken = npmTokenDraft.trim()
  const npmWhoami = useNpmWhoami({ enabled: hasNpmToken })

  useEffect(() => {
    setNpmTokenDraft('')
  }, [npmToken])

  function refreshNpmQueries() {
    queryClient.removeQueries({ queryKey: ['npm'] })
  }

  function handleSaveNpmToken() {
    if (!trimmedNpmToken) return
    refreshNpmQueries()
    setNpmToken(trimmedNpmToken)
  }

  function handleClearNpmToken() {
    refreshNpmQueries()
    clearNpmToken()
  }

  const npmAuthSubtitle = hasNpmToken
    ? npmWhoami.isPending
      ? t('settings.npmTokenChecking')
      : npmWhoami.data?.username
        ? t('settings.npmTokenSignedInAs', { username: npmWhoami.data.username })
        : npmWhoami.isError
          ? t('settings.npmTokenInvalid')
          : t('settings.npmTokenSaved')
    : t('settings.npmTokenNotConfigured')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <main className="page-content">
        <Box orientation="vertical" spacing={12}>
          <PreferencesGroup title={t('settings.appearanceGroup')}>
            <BoxedList>
              <ComboRow
                className="settings-combo-row"
                title={t('settings.theme')}
                subtitle={t('settings.themeSubtitle')}
                options={[
                  { value: 'system', label: t('settings.themeSystem') },
                  { value: 'light', label: t('settings.themeLight') },
                  { value: 'dark', label: t('settings.themeDark') },
                ]}
                value={settings.theme}
                onValueChange={(theme) => updateSettings.mutate({ theme })}
              />
              <ActionRow
                title={t('settings.accentColor')}
                subtitle={t('settings.accentColorSubtitle')}
                trailing={<ColorPicker size="sm" value={settings.accentColor} onChange={(color) => updateSettings.mutate({ accentColor: color })} />}
              />
            </BoxedList>
          </PreferencesGroup>

          <PreferencesGroup title={t('settings.languageGroup')}>
            <BoxedList>
              <ComboRow
                className="settings-combo-row"
                title={t('settings.language')}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'de', label: 'Deutsch' },
                  { value: 'es', label: 'Español' },
                  { value: 'es-CL', label: 'Español (Chile)' },
                  { value: 'es-CO', label: 'Español (Colombia)' },
                  { value: 'es-ES', label: 'Español (España)' },
                  { value: 'es-MX', label: 'Español (México)' },
                  { value: 'es-PE', label: 'Español (Perú)' },
                  { value: 'fr', label: 'Français' },
                  { value: 'it', label: 'Italiano' },
                  { value: 'pt-BR', label: 'Português (Brasil)' },
                  { value: 'qu', label: 'Quechua' },
                  { value: 'zh-CN', label: '中文 (简体)' },
                ]}
                value={settings.language}
                onValueChange={(language) => updateSettings.mutate({ language })}
              />
            </BoxedList>
          </PreferencesGroup>

          <PreferencesGroup title={t('settings.dataGroup')}>
            <BoxedList>
              <ActionRow title={t('settings.syncTitle')} subtitle={t('settings.syncSubtitle')} interactive onClick={() => void navigate({ to: '/sync' })} />
            </BoxedList>
          </PreferencesGroup>

          <PreferencesGroup title={t('settings.npmRegistryGroup')}>
            <BoxedList>
              <ActionRow
                title={t('settings.npmTokenStatus')}
                subtitle={npmAuthSubtitle}
                trailing={
                  hasNpmToken ? (
                    <Button size="sm" variant="destructive" onClick={handleClearNpmToken}>
                      {t('settings.npmTokenRevoke')}
                    </Button>
                  ) : undefined
                }
              />
              <PasswordEntryRow
                title={hasNpmToken ? t('settings.npmTokenReplacePlaceholder') : t('settings.npmTokenPlaceholder')}
                value={npmTokenDraft}
                autoComplete="off"
                onValueChange={setNpmTokenDraft}
                trailing={
                  <Button size="sm" variant="suggested" disabled={!trimmedNpmToken} onClick={handleSaveNpmToken}>
                    {hasNpmToken ? t('settings.npmTokenReplace') : t('settings.npmTokenSave')}
                  </Button>
                }
              />
              <ActionRow
                title={t('settings.npmTokenHelpTitle')}
                subtitle={t('settings.npmTokenHelpSubtitle')}
                trailing={
                  <Link href="https://www.npmjs.com/" external>
                    <Text variant="caption">{t('settings.npmTokenHelpLink')}</Text>
                  </Link>
                }
              />
            </BoxedList>
          </PreferencesGroup>
        </Box>
      </main>
    </div>
  )
}
