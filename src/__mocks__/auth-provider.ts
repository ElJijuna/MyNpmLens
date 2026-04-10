import { type ReactNode } from 'react'

export const useAuth = jest.fn(() => ({ user: null, authLoading: false }))
export const persistGithubToken = jest.fn()
export const clearGithubToken = jest.fn()
export function AuthProvider({ children }: { children: ReactNode }) {
  return children as React.ReactElement
}
