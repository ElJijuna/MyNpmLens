import * as bpHooks from '@api-hooks/bp';
import * as npmApiHooks from '@api-hooks/npm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as npmHooks from '@/modules/npm/hooks';
import { FavoritesPage } from '../index';

jest.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ history: { back: jest.fn() } }),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/favorites' }),
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

describe('FavoritesPage', () => {
  it('shows EmptyState when favorites list is empty', async () => {
    jest.spyOn(npmHooks, 'useFavorites').mockReturnValue({
      data: [],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useFavorites>);

    render(<FavoritesPage />, { wrapper });
    expect(screen.getByText('No packages yet')).toBeInTheDocument();
  });

  it('renders package cards when favorites exist', () => {
    jest.spyOn(npmHooks, 'useFavorites').mockReturnValue({
      data: [
        { name: 'react', addedAt: '2024-01-01T00:00:00.000Z' },
        { name: 'lodash', addedAt: '2024-01-02T00:00:00.000Z' },
      ],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useFavorites>);
    jest
      .spyOn(npmApiHooks, 'useNpmPackage')
      .mockReturnValue({ isPending: true } as ReturnType<typeof npmApiHooks.useNpmPackage>);
    jest
      .spyOn(npmApiHooks, 'useNpmPackageDownloads')
      .mockReturnValue({ data: undefined } as ReturnType<
        typeof npmApiHooks.useNpmPackageDownloads
      >);
    jest
      .spyOn(bpHooks, 'useBpPackageSize')
      .mockReturnValue({ data: undefined } as unknown as ReturnType<
        typeof bpHooks.useBpPackageSize
      >);

    render(<FavoritesPage />, { wrapper });
    expect(screen.queryByText('No packages yet')).not.toBeInTheDocument();
  });

  it('shows the Add package modal when add package is clicked', () => {
    jest.spyOn(npmHooks, 'useFavorites').mockReturnValue({
      data: [],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useFavorites>);

    render(<FavoritesPage />, { wrapper });
    const [addBtn] = screen.getAllByText(/add package/i);
    const addButton = addBtn.closest('button');
    if (!addButton) {
      throw new Error('Add button not found');
    }
    fireEvent.click(addButton);
    expect(screen.getAllByText(/add package/i).length).toBeGreaterThan(1);
  });

  it('opens the Add package modal when the open-dialog-addpackage native event fires', () => {
    jest.spyOn(npmHooks, 'useFavorites').mockReturnValue({
      data: [],
      isSuccess: true,
    } as unknown as ReturnType<typeof npmHooks.useFavorites>);

    let capturedHandler: (() => void) | undefined;
    mockUseNativeEvent.mockImplementation((type: string, handler: () => void) => {
      if (type === 'open-dialog-addpackage') {
        capturedHandler = handler;
      }
    });

    render(<FavoritesPage />, { wrapper });

    act(() => {
      capturedHandler?.();
    });

    expect(screen.getAllByText(/add package/i).length).toBeGreaterThan(1);
  });
});
