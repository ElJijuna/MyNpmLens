jest.mock('@/lib/analytics', () => ({
  Analytics: { appUpdate: jest.fn() },
}))

jest.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: jest.fn(),
}))

import { render, screen, fireEvent } from '@testing-library/react'
import { OfflineBanner } from '../index'
import { Analytics } from '@/lib/analytics'
import { useRegisterSW } from 'virtual:pwa-register/react'

const mockUseRegisterSW = useRegisterSW as jest.Mock

afterEach(() => jest.clearAllMocks())

function setupSW(needRefresh: boolean) {
  const setNeedRefresh = jest.fn()
  const updateServiceWorker = jest.fn()
  mockUseRegisterSW.mockReturnValue({
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  })
  return { setNeedRefresh, updateServiceWorker }
}

describe('OfflineBanner', () => {
  it('renders nothing when no update is available', () => {
    setupSW(false)
    render(<OfflineBanner />)
    expect(screen.queryByText(/new version/i)).not.toBeInTheDocument()
  })

  it('shows update dialog when new version is available', () => {
    setupSW(true)
    render(<OfflineBanner />)
    expect(screen.getByText(/new version available/i)).toBeInTheDocument()
  })

  it('logs Analytics.appUpdate and triggers SW update on Update click', () => {
    const { updateServiceWorker } = setupSW(true)
    render(<OfflineBanner />)

    fireEvent.click(screen.getByRole('button', { hidden: true, name: 'Update' }))

    expect(Analytics.appUpdate).toHaveBeenCalledTimes(1)
    expect(updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('does not log analytics when Cancel is clicked', () => {
    setupSW(true)
    render(<OfflineBanner />)

    fireEvent.click(screen.getByRole('button', { hidden: true, name: 'Cancel' }))

    expect(Analytics.appUpdate).not.toHaveBeenCalled()
  })
})
