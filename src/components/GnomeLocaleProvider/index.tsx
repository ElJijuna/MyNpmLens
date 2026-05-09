import { GnomeProvider } from '@gnome-ui/react'
import { DEFAULT_SETTINGS } from '@/modules/settings/domain'
import { useSettings } from '@/modules/settings/hooks'
import { resolveIntlLocale } from '@/lib/locale'
import type { ReactNode } from 'react'

interface GnomeLocaleProviderProps {
  children: ReactNode
}

export function GnomeLocaleProvider({ children }: GnomeLocaleProviderProps) {
  const { data: settings = DEFAULT_SETTINGS } = useSettings()

  return (
    <GnomeProvider
      locale={resolveIntlLocale(settings.language)}
      numberFormat={{ notation: 'compact', compactDisplay: 'short' }}
    >
      {children}
    </GnomeProvider>
  )
}
