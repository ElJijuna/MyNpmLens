export type Language = 'en' | 'de' | 'es' | 'es-CL' | 'es-CO' | 'es-ES' | 'es-MX' | 'es-PE' | 'fr' | 'it' | 'pt-BR' | 'qu' | 'zh-CN'

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: Language
  accentColor?: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
}
