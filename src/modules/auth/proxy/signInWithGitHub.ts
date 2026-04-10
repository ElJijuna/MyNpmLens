import { GithubAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from './firebase'
import { persistGithubToken } from '@/modules/auth/AuthProvider'
import type { AuthUser } from '@/modules/auth/domain'

const provider = new GithubAuthProvider()

export async function signInWithGitHub(): Promise<AuthUser> {
  const result = await signInWithPopup(auth, provider)
  const credential = GithubAuthProvider.credentialFromResult(result)

  if (!credential?.accessToken) {
    throw new Error('GitHub access token not returned by Firebase')
  }

  persistGithubToken(credential.accessToken)

  return {
    uid: result.user.uid,
    displayName: result.user.displayName,
    email: result.user.email,
    photoURL: result.user.photoURL,
    githubToken: credential.accessToken,
  }
}
