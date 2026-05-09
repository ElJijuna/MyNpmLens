import type { Language } from '@/modules/settings/domain'

const LOCALE_FALLBACKS: Record<Language, string> = {
  en: 'en-US',
  de: 'de-DE',
  es: 'es',
  'es-CL': 'es-CL',
  'es-CO': 'es-CO',
  'es-ES': 'es-ES',
  'es-MX': 'es-MX',
  'es-PE': 'es-PE',
  fr: 'fr-FR',
  it: 'it-IT',
  'pt-BR': 'pt-BR',
  qu: 'es-PE',
  'zh-CN': 'zh-CN',
}

export function resolveIntlLocale(language: Language): string {
  const locale = LOCALE_FALLBACKS[language] ?? 'en-US'
  return Intl.DateTimeFormat.supportedLocalesOf(locale)[0] ?? 'en-US'
}
