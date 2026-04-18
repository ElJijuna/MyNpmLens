const defaultQuery = { data: undefined, isLoading: false, isError: false }

export const useOsvVuln = jest.fn(() => defaultQuery)
export const useOsvQuery = jest.fn(() => defaultQuery)
export const useOsvQueryBatch = jest.fn(() => defaultQuery)
export const osvQueryKeys = {}
