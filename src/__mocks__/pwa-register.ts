export const useRegisterSW = jest.fn(() => ({
  needRefresh: [false, jest.fn()],
  updateServiceWorker: jest.fn(),
}))
