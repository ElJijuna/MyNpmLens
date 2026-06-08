import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from '../locales/de/common.json';
import en from '../locales/en/common.json';
import es from '../locales/es/common.json';
import esCL from '../locales/es-CL/common.json';
import esCO from '../locales/es-CO/common.json';
import esES from '../locales/es-ES/common.json';
import esMX from '../locales/es-MX/common.json';
import esPE from '../locales/es-PE/common.json';
import fr from '../locales/fr/common.json';
import it from '../locales/it/common.json';
import ptBR from '../locales/pt-BR/common.json';
import qu from '../locales/qu/common.json';
import zhCN from '../locales/zh-CN/common.json';

function getInitialLanguage(): string {
  try {
    const raw = localStorage.getItem('mynpmlens:settings');
    if (raw) {
      const settings = JSON.parse(raw) as Record<string, unknown>;
      if (typeof settings.language === 'string') {
        return settings.language;
      }
    }
  } catch {
    // ignore
  }
  return 'en';
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
    de: { common: de },
    es: { common: es },
    'es-CL': { common: esCL },
    'es-CO': { common: esCO },
    'es-ES': { common: esES },
    'es-MX': { common: esMX },
    'es-PE': { common: esPE },
    fr: { common: fr },
    it: { common: it },
    'pt-BR': { common: ptBR },
    qu: { common: qu },
    'zh-CN': { common: zhCN },
  },
  lng: getInitialLanguage(),
  fallbackLng: {
    'es-CL': ['es', 'en'],
    'es-CO': ['es', 'en'],
    'es-ES': ['es', 'en'],
    'es-MX': ['es', 'en'],
    'es-PE': ['es', 'en'],
    de: ['en'],
    fr: ['en'],
    it: ['en'],
    'pt-BR': ['en'],
    qu: ['es', 'en'],
    'zh-CN': ['en'],
    default: ['en'],
  },
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
