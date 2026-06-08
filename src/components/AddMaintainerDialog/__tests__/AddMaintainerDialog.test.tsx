jest.mock('@/lib/analytics', () => ({
  Analytics: { addMaintainer: jest.fn() },
}));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Analytics } from '@/lib/analytics';
import { AddMaintainerDialog } from '../index';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => localStorage.clear());
afterEach(() => jest.clearAllMocks());

describe('AddMaintainerDialog', () => {
  it('renders when open', () => {
    render(<AddMaintainerDialog open={true} onClose={() => {}} />, { wrapper });
    expect(screen.getByText('Add maintainer')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<AddMaintainerDialog open={false} onClose={() => {}} />, { wrapper });
    expect(screen.queryByText('Add maintainer')).not.toBeInTheDocument();
  });

  it('logs Analytics.addMaintainer with username on confirm', async () => {
    render(<AddMaintainerDialog open={true} onClose={() => {}} />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/sindresorhus/i), {
      target: { value: 'sindresorhus' },
    });
    fireEvent.click(screen.getByRole('button', { hidden: true, name: 'Add' }));

    await waitFor(() => expect(Analytics.addMaintainer).toHaveBeenCalledWith('sindresorhus'));
  });
});
