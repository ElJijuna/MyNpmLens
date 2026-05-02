import en from '../locales/en/common.json'

type NestedRecord = { [key: string]: string | NestedRecord }

function lookup(obj: NestedRecord, path: string): string {
  const parts = path.split('.')
  let current: string | NestedRecord = obj
  for (const part of parts) {
    if (typeof current !== 'object' || !(part in current)) return path
    current = current[part]
  }
  return typeof current === 'string' ? current : path
}

function t(key: string, opts?: Record<string, unknown>): string {
  let value = lookup(en as unknown as NestedRecord, key)
  if (opts) {
    value = Object.entries(opts).reduce(
      (str, [k, v]) => str.replace(new RegExp(`{{${k}}}`, 'g'), String(v)),
      value,
    )
  }
  return value
}

export const useTranslation = () => ({
  t,
  i18n: { changeLanguage: jest.fn(), language: 'en' },
})

export const initReactI18next = { type: '3rdParty', init: jest.fn() }
