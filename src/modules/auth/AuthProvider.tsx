import { GhClientProvider } from '@api-hooks/gh'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from './proxy/firebase'
import type { AuthUser } from './domain'

const GITHUB_TOKEN_KEY = 'mynpmlens:github_token'

export function persistGithubToken(token: string): void {
  localStorage.setItem(GITHUB_TOKEN_KEY, token)
}

export function clearGithubToken(): void {
  localStorage.removeItem(GITHUB_TOKEN_KEY)
}

function readGithubToken(): string {
  return localStorage.getItem(GITHUB_TOKEN_KEY) ?? ''
}

interface AuthContextValue {
  user: AuthUser | null
  authLoading: boolean
  setGithubToken: (token: string) => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  authLoading: true,
  setGithubToken: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const ghClientOptions = useMemo(() => (user?.githubToken ? { token: user.githubToken } : undefined), [user?.githubToken])

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          githubToken: readGithubToken(),
        })
      } else {
        clearGithubToken()
        setUser(null)
      }
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  function setGithubToken(token: string) {
    persistGithubToken(token)
    setUser((prev) => (prev ? { ...prev, githubToken: token } : null))
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, setGithubToken }}>
      <GhClientProvider options={ghClientOptions}>{children}</GhClientProvider>
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
