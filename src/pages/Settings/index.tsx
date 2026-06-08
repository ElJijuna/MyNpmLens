import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { PreferencesGroup, BoxedList, ComboRow, ActionRow, ColorPicker, Box } from '@gnome-ui/react'
import { useSettings, useUpdateSettings } from '@/modules/settings/hooks'
import { DEFAULT_SETTINGS } from '@/modules/settings/domain'

export function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: settings = DEFAULT_SETTINGS } = useSettings()
  const updateSettings = useUpdateSettings()

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
        </Box>
      </main>
    </div>
  )
}
