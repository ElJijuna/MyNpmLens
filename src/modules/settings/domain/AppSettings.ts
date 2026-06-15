export type Language =
  | 'en'
  | 'de'
  | 'es'
  | 'es-CL'
  | 'es-CO'
  | 'es-ES'
  | 'es-MX'
  | 'es-PE'
  | 'fr'
  | 'it'
  | 'pt-BR'
  | 'qu'
  | 'zh-CN';

export type NumberFormatMode = 'compact' | 'standard';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: Language;
  numberFormat: NumberFormatMode;
  accentColor?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
  numberFormat: 'compact',
};

export function resolveNumberFormatOptions(
  numberFormat: NumberFormatMode,
): Intl.NumberFormatOptions {
  return numberFormat === 'compact'
    ? { notation: 'compact', compactDisplay: 'short' }
    : { notation: 'standard' };
}
