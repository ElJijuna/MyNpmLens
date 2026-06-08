const defaultQuery = { data: undefined, isLoading: false, isError: false };

export const useBpPackageSize = jest.fn(() => defaultQuery);
export const useBpPackageVersionSize = jest.fn(() => defaultQuery);
export const useBpPackageHistory = jest.fn(() => defaultQuery);
export const useBpPackageSimilar = jest.fn(() => defaultQuery);
export const bpQueryKeys = {};
