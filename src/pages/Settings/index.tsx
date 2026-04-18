import { PreferencesPage, PreferencesGroup, BoxedList, ComboRow } from '@gnome-ui/react'
import { Toolbar } from '@/components/Toolbar'
import { useSettings, useUpdateSettings } from '@/modules/settings/hooks'
import { DEFAULT_SETTINGS } from '@/modules/settings/domain'

export function SettingsPage() {
  const { data: settings = DEFAULT_SETTINGS } = useSettings()
  const updateSettings = useUpdateSettings()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Toolbar />

      <main className="page-content">
        <PreferencesPage title="Settings">
          <PreferencesGroup title="Appearance">
            <BoxedList>
              <ComboRow
                title="Theme"
                subtitle="Choose the color scheme"
                options={[
                  { value: 'system', label: 'System default' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ]}
                value={settings.theme}
                onValueChange={(theme) => updateSettings.mutate({ theme })}
              />
            </BoxedList>
          </PreferencesGroup>

          <PreferencesGroup title="Language">
            <BoxedList>
              <ComboRow
                title="Language"
                options={[{ value: 'en', label: 'English' }]}
                value="en"
                disabled
              />
            </BoxedList>
          </PreferencesGroup>
        </PreferencesPage>
      </main>
    </div>
  )
}
