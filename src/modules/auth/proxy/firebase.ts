import { type Analytics, getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;

export let auth: Auth | null = null;
export let analytics: Analytics | null = null;

if (apiKey) {
  const app = initializeApp({
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  });
  auth = getAuth(app);
  analytics = getAnalytics(app);
}
