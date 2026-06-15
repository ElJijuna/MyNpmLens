import { DEFAULT_SETTINGS } from '@/modules/settings/domain';
import { parseGistContent, stringifyGistContent } from '../gistContent';

describe('gistContent', () => {
  it('preserves number format when serializing settings', () => {
    const content = stringifyGistContent({
      favorites: [],
      maintainers: [],
      settings: { ...DEFAULT_SETTINGS, numberFormat: 'standard' },
    });

    expect(JSON.parse(content).settings.numberFormat).toBe('standard');
  });

  it('preserves number format when parsing remote settings', () => {
    const parsed = parseGistContent(
      JSON.stringify({
        favorites: [],
        maintainers: [],
        settings: { ...DEFAULT_SETTINGS, numberFormat: 'standard' },
      }),
    );

    expect(parsed.settings.numberFormat).toBe('standard');
  });

  it('defaults missing number format for older gist payloads', () => {
    const parsed = parseGistContent(
      JSON.stringify({
        favorites: [],
        maintainers: [],
        settings: { theme: 'dark', language: 'es' },
      }),
    );

    expect(parsed.settings).toEqual({
      ...DEFAULT_SETTINGS,
      theme: 'dark',
      language: 'es',
    });
  });
});
