// Firebase SDK Initialization and Environment Configuration
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const STORAGE_KEY = 'saathi_custom_firebase_config';

/**
 * Retrieve Firebase configuration with precedence:
 * 1. Custom in-app config from localStorage (enables live testing without restarting Next.js server)
 * 2. Next.js environment variables (NEXT_PUBLIC_FIREBASE_*)
 */
export function getFirebaseConfig(): FirebaseClientConfig | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FirebaseClientConfig;
        if (parsed?.apiKey && parsed?.projectId) {
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }

  const envConfig: FirebaseClientConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (envConfig.apiKey && envConfig.projectId && envConfig.apiKey !== 'your-api-key-here') {
    return envConfig;
  }

  return null;
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
}

export function saveCustomFirebaseConfig(config: FirebaseClientConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.location.reload();
  }
}

export function clearCustomFirebaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(config);
    }
    return appInstance;
  } catch (err) {
    console.warn('[Firebase] App initialization error:', err);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  if (authInstance) return authInstance;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    authInstance = getAuth(app);
    return authInstance;
  } catch (err) {
    console.warn('[Firebase] Auth initialization error:', err);
    return null;
  }
}

export function getFirebaseFirestore(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    firestoreInstance = getFirestore(app);
    return firestoreInstance;
  } catch (err) {
    console.warn('[Firebase] Firestore initialization error:', err);
    return null;
  }
}
