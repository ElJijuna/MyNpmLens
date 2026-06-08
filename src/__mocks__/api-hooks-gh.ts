const defaultQuery = {
  data: undefined,
  isPending: false,
  isError: false,
  isSuccess: false,
  fetchStatus: 'idle' as const,
};

export const useGhGist = jest.fn(() => ({ data: undefined, isLoading: false, isError: false }));
export const useGhGists = jest.fn(() => ({ data: undefined, isLoading: false, isSuccess: false }));
export const useGhCreateGist = jest.fn(() => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isPending: false,
}));
export const useGhUpdateGist = jest.fn(() => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isPending: false,
}));
export const useGhDeleteGist = jest.fn(() => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isPending: false,
}));
export const useGhUser = jest.fn(() => ({ data: undefined, isLoading: false }));
export const useGhRepo = jest.fn(() => defaultQuery);
export const useGhRepoLatestRelease = jest.fn(() => defaultQuery);
