import { useMutation } from '@tanstack/react-query'
import { signInWithGitHub } from '@/modules/auth/proxy'
import { useAuth } from '@/modules/auth/AuthProvider'

export function useSignIn() {
  const { setGithubToken } = useAuth()
  return useMutation({
    mutationFn: signInWithGitHub,
    onSuccess: (authUser) => setGithubToken(authUser.githubToken),
  })
}
