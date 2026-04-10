export interface AuthUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  githubToken: string
}
