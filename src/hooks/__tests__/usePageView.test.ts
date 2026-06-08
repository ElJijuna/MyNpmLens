import { renderHook } from '@testing-library/react'
import { logEvent } from 'firebase/analytics'
import { usePageView } from '@/hooks/usePageView'

jest.mock('@/modules/auth/proxy/firebase', () => ({ analytics: {} }))

const mockPathname = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => string }) => select({ location: { pathname: mockPathname() } }),
}))

afterEach(() => jest.clearAllMocks())

describe('usePageView', () => {
  it('logs page_view on mount', () => {
    mockPathname.mockReturnValue('/packages/react')

    renderHook(() => usePageView())

    expect(logEvent).toHaveBeenCalledWith(expect.anything(), 'page_view', {
      page_path: '/packages/react',
    })
  })

  it('logs page_view again when pathname changes', () => {
    mockPathname.mockReturnValue('/')
    const { rerender } = renderHook(() => usePageView())

    mockPathname.mockReturnValue('/about')
    rerender()

    expect(logEvent).toHaveBeenCalledTimes(2)
    expect(logEvent).toHaveBeenLastCalledWith(expect.anything(), 'page_view', {
      page_path: '/about',
    })
  })
})
