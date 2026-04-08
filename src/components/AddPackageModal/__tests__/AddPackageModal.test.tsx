import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { AddPackageModal } from '../index'

// @gnome-ui Dialog wraps content in aria-hidden backdrop.
// getByRole needs { hidden: true }; getByText/getByPlaceholderText query the DOM directly.
function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

beforeEach(() => localStorage.clear())

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
      expect(screen.getByText(/valid npm URL/i)).toBeInTheDocument()
    })
  })

  it('calls onClose after adding a valid package name', async () => {
    const onClose = jest.fn()
    render(<AddPackageModal open={true} onClose={onClose} />, { wrapper })

    fireEvent.change(screen.getByPlaceholderText(/npmjs\.com\/package/i), {
      target: { value: 'react' },
    })
    fireEvent.click(screen.getByRole('button', { hidden: true, name: 'Add' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('accepts a full npmjs.com URL', async () => {
    const onClose = jest.fn()
    render(<AddPackageModal open={true} onClose={onClose} />, { wrapper })

    fireEvent.change(screen.getByPlaceholderText(/npmjs\.com\/package/i), {
      target: { value: 'https://www.npmjs.com/package/@tanstack/react-query' },
    })
    fireEvent.click(screen.getByRole('button', { hidden: true, name: 'Add' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
