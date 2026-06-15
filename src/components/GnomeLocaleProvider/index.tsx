import { GnomeProvider } from '@gnome-ui/react';
import type { ReactNode } from 'react';
import { resolveIntlLocale } from '@/lib/locale';
import { DEFAULT_SETTINGS, resolveNumberFormatOptions } from '@/modules/settings/domain';
import { useSettings } from '@/modules/settings/hooks';

interface GnomeLocaleProviderProps {
  children: ReactNode;
}

export const GnomeLocaleProvider = ({ children }: GnomeLocaleProviderProps) => {
  const { data: settings = DEFAULT_SETTINGS } = useSettings();

  return (
    <GnomeProvider
      locale={resolveIntlLocale(settings.language)}
      numberFormat={resolveNumberFormatOptions(settings.numberFormat)}
    >
      {children}
    </GnomeProvider>
  );
};
