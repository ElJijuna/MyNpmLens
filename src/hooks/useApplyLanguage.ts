import { useEffect } from 'react'
import { useSettings } from '@/modules/settings/hooks'
import { DEFAULT_SETTINGS } from '@/modules/settings/domain'
import i18n from '@/lib/i18n'

export function useApplyLanguage() {
  const { data: settings = DEFAULT_SETTINGS } = useSettings()

  useEffect(() => {
    if (i18n.language !== settings.language) {
      void i18n.changeLanguage(settings.language)
    }
  }, [settings.language])
}
