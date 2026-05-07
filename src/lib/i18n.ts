import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en/common.json'
import es from '../locales/es/common.json'
import esCL from '../locales/es-CL/common.json'
import esES from '../locales/es-ES/common.json'
import esPE from '../locales/es-PE/common.json'
import fr from '../locales/fr/common.json'
import it from '../locales/it/common.json'
import qu from '../locales/qu/common.json'

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
    'es-CL': { common: esCL },
    'es-ES': { common: esES },
    'es-PE': { common: esPE },
    fr: { common: fr },
    it: { common: it },
    qu: { common: qu },
  },
  lng: getInitialLanguage(),
  fallbackLng: {
    'es-CL': ['es', 'en'],
    'es-ES': ['es', 'en'],
    'es-PE': ['es', 'en'],
    fr: ['en'],
    it: ['en'],
    qu: ['es', 'en'],
    default: ['en'],
  },
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export default i18n
