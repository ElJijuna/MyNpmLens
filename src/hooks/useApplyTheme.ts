import { useEffect } from 'react'
import { useSettings } from '@/modules/settings/hooks'

export function useApplyTheme() {
  const { data: settings } = useSettings()
  const theme = settings?.theme ?? 'system'

  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])
}
