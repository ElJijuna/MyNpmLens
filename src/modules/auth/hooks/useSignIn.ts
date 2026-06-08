import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/AuthProvider';
import { signInWithGitHub } from '@/modules/auth/proxy';

export function useSignIn() {
  const { setGithubToken } = useAuth();
  return useMutation({
    mutationFn: signInWithGitHub,
    onSuccess: (authUser) => setGithubToken(authUser.githubToken),
  });
}
