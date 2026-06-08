import { renderHook } from '@testing-library/react';
import { usePageView } from '@/hooks/usePageView';
import { Analytics } from '@/lib/analytics';

jest.mock('@/lib/analytics', () => ({
  Analytics: {
    pageView: jest.fn(),
  },
}));

const mockPathname = jest.fn();

jest.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: mockPathname() } }),
}));

afterEach(() => jest.clearAllMocks());

describe('usePageView', () => {
  it('logs page_view on mount', () => {
    mockPathname.mockReturnValue('/packages/react');

    renderHook(() => usePageView());

    expect(Analytics.pageView).toHaveBeenCalledWith('/packages/react');
  });

  it('logs page_view again when pathname changes', () => {
    mockPathname.mockReturnValue('/');
    const { rerender } = renderHook(() => usePageView());

    mockPathname.mockReturnValue('/about');
    rerender();

    expect(Analytics.pageView).toHaveBeenCalledTimes(2);
    expect(Analytics.pageView).toHaveBeenLastCalledWith('/about');
  });
});
