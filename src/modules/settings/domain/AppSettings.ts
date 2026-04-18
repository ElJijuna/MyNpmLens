export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'en'
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
}
