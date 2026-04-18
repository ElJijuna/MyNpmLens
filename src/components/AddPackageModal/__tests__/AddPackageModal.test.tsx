import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { AddPackageModal } from '../index'
import * as npmjsClient from 'npmjs-api-client'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const MOCK_PACKUMENT = {
  name: 'react',
  'dist-tags': { latest: '19.0.0' },
  versions: {},
  time: {},
}

beforeEach(() => localStorage.clear())
afterEach(() => jest.restoreAllMocks())

function mockNpmClientGet(resolveValue: unknown) {
  jest.spyOn(npmjsClient.NpmClient.prototype, 'package').mockReturnValue({
    get: () => Promise.resolve(resolveValue),
  } as unknown as ReturnType<typeof npmjsClient.NpmClient.prototype['package']>)
}

describe('AddPackageModal', () => {
  it('renders when open', () => {
    render(<AddPackageModal open={true} onClose={() => {}} />, { wrapper })
    expect(screen.getByText('Add package')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<AddPackageModal open={false} onClose={() => {}} />, { wrapper })
    expect(screen.queryByText('Add package')).not.toBeInTheDocument()
  })

  it('shows validation error for invalid input', async () => {
    render(<AddPackageModal open={true} onClose={() => {}} />, { wrapper })

    fireEvent.change(screen.getByPlaceholderText(/npmjs\.com\/package/i), {
      target: { value: 'Invalid Package Name!' },
    })
    fireEvent.click(screen.getByRole('button', { hidden: true, name: 'Add' }))

    await waitFor(() => {
      expect(screen.getByText(/valid package name/i)).toBeInTheDocument()
    })
  })

  it('calls onClose after adding a valid package name', async () => {
    mockNpmClientGet(MOCK_PACKUMENT)
    const onClose = jest.fn()
    render(<AddPackageModal open={true} onClose={onClose} />, { wrapper })

    fireEvent.change(screen.getByPlaceholderText(/npmjs\.com\/package/i), {
      target: { value: 'react' },
    })
    fireEvent.click(screen.getByRole('button', { hidden: true, name: 'Add' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('accepts a full npmjs.com URL', async () => {
    mockNpmClientGet(MOCK_PACKUMENT)
    const onClose = jest.fn()
    render(<AddPackageModal open={true} onClose={onClose} />, { wrapper })

    fireEvent.change(screen.getByPlaceholderText(/npmjs\.com\/package/i), {
      target: { value: 'https://www.npmjs.com/package/@tanstack/react-query' },
    })
    fireEvent.click(screen.getByRole('button', { hidden: true, name: 'Add' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
