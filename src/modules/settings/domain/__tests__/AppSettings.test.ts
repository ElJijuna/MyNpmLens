import { DEFAULT_SETTINGS, resolveNumberFormatOptions } from '../AppSettings';

describe('AppSettings', () => {
  it('defaults number formatting to compact mode', () => {
    expect(DEFAULT_SETTINGS.numberFormat).toBe('compact');
  });

  it('resolves compact Intl.NumberFormat options', () => {
    expect(resolveNumberFormatOptions('compact')).toEqual({
      notation: 'compact',
      compactDisplay: 'short',
    });
  });

  it('resolves standard Intl.NumberFormat options', () => {
    expect(resolveNumberFormatOptions('standard')).toEqual({
      notation: 'standard',
    });
  });
});
