import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { AddPackageModal } from '../index'
import * as proxy from '@/modules/npm/proxy'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const MOCK_PKG = {
  name: 'react', version: '19.0.0', versions: ['19.0.0'], distTags: { latest: '19.0.0' },
  description: '', license: 'MIT', homepage: null, author: null, repository: null,
}

beforeEach(() => localStorage.clear())
afterEach(() => jest.restoreAllMocks())

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
    jest.spyOn(proxy, 'fetchNpmPackage').mockResolvedValueOnce(MOCK_PKG)
    const onClose = jest.fn()
    render(<AddPackageModal open={true} onClose={onClose} />, { wrapper })

    fireEvent.change(screen.getByPlaceholderText(/npmjs\.com\/package/i), {
      target: { value: 'react' },
    })
    fireEvent.click(screen.getByRole('button', { hidden: true, name: 'Add' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('accepts a full npmjs.com URL', async () => {
    jest.spyOn(proxy, 'fetchNpmPackage').mockResolvedValueOnce(MOCK_PKG)
    const onClose = jest.fn()
    render(<AddPackageModal open={true} onClose={onClose} />, { wrapper })

    fireEvent.change(screen.getByPlaceholderText(/npmjs\.com\/package/i), {
      target: { value: 'https://www.npmjs.com/package/@tanstack/react-query' },
    })
    fireEvent.click(screen.getByRole('button', { hidden: true, name: 'Add' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
