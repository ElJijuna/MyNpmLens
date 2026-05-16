import { type ReactNode } from 'react'

export const useToast = jest.fn(() => ({ show: jest.fn() }))
export const ToastProvider = ({ children }: { children: ReactNode }) => children
