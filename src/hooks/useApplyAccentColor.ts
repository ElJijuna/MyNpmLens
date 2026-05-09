import { useEffect } from 'react'
import { useSettings } from '@/modules/settings/hooks'

export function useApplyAccentColor() {
  const { data: settings } = useSettings()
  const accentColor = settings?.accentColor

  useEffect(() => {
    if (accentColor) {
      document.documentElement.style.setProperty('--gnome-accent-bg-color', accentColor)
    } else {
      document.documentElement.style.removeProperty('--gnome-accent-bg-color')
    }
  }, [accentColor])
}
