import { useMutation } from '@tanstack/react-query'
import { signInWithGitHub } from '@/modules/auth/proxy'

export function useSignIn() {
  return useMutation({
    mutationFn: signInWithGitHub,
  })
}
