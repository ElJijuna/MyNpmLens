import { useTranslation } from 'react-i18next'
import { PreferencesPage, PreferencesGroup, BoxedList, ComboRow } from '@gnome-ui/react'
import { Toolbar } from '@/components/Toolbar'
import { useSettings, useUpdateSettings } from '@/modules/settings/hooks'
import { DEFAULT_SETTINGS } from '@/modules/settings/domain'

export function SettingsPage() {
  const { t } = useTranslation()
  const { data: settings = DEFAULT_SETTINGS } = useSettings()
  const updateSettings = useUpdateSettings()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Toolbar />

      <main className="page-content">
        <PreferencesPage title={t('settings.title')}>
          <PreferencesGroup title={t('settings.appearanceGroup')}>
            <BoxedList>
              <ComboRow
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
            </BoxedList>
          </PreferencesGroup>

          <PreferencesGroup title={t('settings.languageGroup')}>
            <BoxedList>
              <ComboRow
                title={t('settings.language')}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Español' },
                  { value: 'es-PE', label: 'Español (Perú)' },
                ]}
                value={settings.language}
                onValueChange={(language) => updateSettings.mutate({ language })}
              />
            </BoxedList>
          </PreferencesGroup>
        </PreferencesPage>
      </main>
    </div>
  )
}
