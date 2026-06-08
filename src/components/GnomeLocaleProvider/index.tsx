import { GnomeProvider } from '@gnome-ui/react';
import type { ReactNode } from 'react';
import { resolveIntlLocale } from '@/lib/locale';
import { DEFAULT_SETTINGS } from '@/modules/settings/domain';
import { useSettings } from '@/modules/settings/hooks';

interface GnomeLocaleProviderProps {
  children: ReactNode;
}

export const GnomeLocaleProvider = ({ children }: GnomeLocaleProviderProps) => {
  const { data: settings = DEFAULT_SETTINGS } = useSettings();

  return (
    <GnomeProvider
      locale={resolveIntlLocale(settings.language)}
      numberFormat={{ notation: 'compact', compactDisplay: 'short' }}
    >
      {children}
    </GnomeProvider>
  );
};
