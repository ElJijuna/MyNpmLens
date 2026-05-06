export type Language = 'en' | 'es' | 'es-PE'

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: Language
  accentColor?: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
}
