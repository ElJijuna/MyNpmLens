import { signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from './firebase'

export async function signOut(): Promise<void> {
  if (!auth) return
  await firebaseSignOut(auth)
}
