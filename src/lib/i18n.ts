import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en/common.json'
import es from '../locales/es/common.json'
import esPE from '../locales/es-PE/common.json'

function getInitialLanguage(): string {
  try {
    const raw = localStorage.getItem('mynpmlens:settings')
    if (raw) {
      const settings = JSON.parse(raw) as Record<string, unknown>
      if (typeof settings.language === 'string') return settings.language
    }
  } catch {
    // ignore
  }
  return 'en'
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
    es: { common: es },
    'es-PE': { common: esPE },
  },
  lng: getInitialLanguage(),
  fallbackLng: {
    'es-PE': ['es', 'en'],
    default: ['en'],
  },
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export default i18n
