import * as npmApiHooks from '@api-hooks/npm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as npmHooks from '@/modules/npm/hooks';
import { DashboardPage } from '../index';

jest.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ history: { back: jest.fn() } }),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

const mockUsePlatform = jest.fn();
const mockUseNativeEvent = jest.fn();

jest.mock('@gnome-ui/hooks', () => ({
  usePlatform: () => mockUsePlatform(),
  useNativeEvent: (type: string, handler: () => void) => mockUseNativeEvent(type, handler),
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  localStorage.clear();
  mockUsePlatform.mockReturnValue({ isGnomeWebView: false });
  mockUseNativeEvent.mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('DashboardPage', () => {
  it('shows the new dashboard overview', async () => {
    jest.spyOn(npmHooks, 'useFavorites').mockReturnValue({
      data: [],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useFavorites>);
    jest.spyOn(npmHooks, 'useMaintainers').mockReturnValue({
      data: [],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useMaintainers>);
    jest.spyOn(npmApiHooks, 'useNpmBulkDownloads').mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof npmApiHooks.useNpmBulkDownloads>);

    render(<DashboardPage />, { wrapper });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Discover packages')).toBeInTheDocument();
  });

  it('renders summary metrics when saved data exists', () => {
    jest.spyOn(npmHooks, 'useFavorites').mockReturnValue({
      data: [
        { name: 'react', addedAt: '2024-01-01T00:00:00.000Z' },
        { name: 'lodash', addedAt: '2024-01-02T00:00:00.000Z' },
      ],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useFavorites>);
    jest.spyOn(npmHooks, 'useMaintainers').mockReturnValue({
      data: [{ username: 'sindresorhus', addedAt: '2024-01-03T00:00:00.000Z' }],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useMaintainers>);
    jest.spyOn(npmApiHooks, 'useNpmBulkDownloads').mockReturnValue({
      data: {
        react: { downloads: 1000, package: 'react', start: '', end: '' },
        lodash: { downloads: 2000, package: 'lodash', start: '', end: '' },
      },
    } as unknown as ReturnType<typeof npmApiHooks.useNpmBulkDownloads>);

    render(<DashboardPage />, { wrapper });
    expect(screen.getByText('Favorite Packages')).toBeInTheDocument();
    expect(screen.getByText('Followed Maintainers')).toBeInTheDocument();
    expect(screen.getByText('Weekly downloads')).toBeInTheDocument();
  });

  it('shows the Add package modal when toolbar button is clicked', () => {
    jest.spyOn(npmHooks, 'useFavorites').mockReturnValue({
      data: [],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useFavorites>);
    jest.spyOn(npmHooks, 'useMaintainers').mockReturnValue({
      data: [],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useMaintainers>);

    render(<DashboardPage />, { wrapper });
    const addButton = screen.getByText('Add').closest('button');
    if (!addButton) {
      throw new Error('Add button not found');
    }
    fireEvent.click(addButton);
    expect(screen.getByRole('dialog', { hidden: true, name: /add package/i })).toBeInTheDocument();
  });

  it('opens the Add package modal when the open-dialog-addpackage native event fires', () => {
    jest.spyOn(npmHooks, 'useFavorites').mockReturnValue({
      data: [],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useFavorites>);
    jest.spyOn(npmHooks, 'useMaintainers').mockReturnValue({
      data: [],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useMaintainers>);

    let capturedHandler: (() => void) | undefined;
    mockUseNativeEvent.mockImplementation((type: string, handler: () => void) => {
      if (type === 'open-dialog-addpackage') {
        capturedHandler = handler;
      }
    });

    render(<DashboardPage />, { wrapper });

    act(() => {
      capturedHandler?.();
    });

    expect(screen.getByRole('dialog', { hidden: true, name: /add package/i })).toBeInTheDocument();
  });
});
