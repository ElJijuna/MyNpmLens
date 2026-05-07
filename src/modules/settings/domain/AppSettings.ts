export type Language = 'en' | 'es' | 'es-CL' | 'es-ES' | 'es-PE' | 'fr' | 'it' | 'qu'

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: Language
  accentColor?: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
}
