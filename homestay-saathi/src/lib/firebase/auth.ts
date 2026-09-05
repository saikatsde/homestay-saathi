// Firebase Authentication & User Session Management
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirebaseAuth } from './config';
import { db } from '../db';

export interface UserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  providerId: string;
}

type AuthListener = (session: UserSession | null) => void;
const authListeners = new Set<AuthListener>();
let currentSession: UserSession | null = null;

export function getCurrentSession(): UserSession | null {
  return currentSession;
}

/**
 * Syncs the Firebase authentication state into local Dexie syncMeta table
 */
async function syncSessionToLocalDb(session: UserSession | null) {
  try {
    const meta = await db.syncMeta.get('singleton');
    if (meta) {
      await db.syncMeta.update('singleton', {
        uid: session?.uid || null,
        userEmail: session?.email || null,
        authProvider: session ? (session.isAnonymous ? 'anonymous' : session.providerId || 'password') : null,
        authState: session ? (session.isAnonymous ? 'anonymous' : 'authenticated') : 'anonymous',
      });
    }
  } catch (err) {
    console.warn('[Auth] Failed to sync auth state to Dexie:', err);
  }
}

/**
 * Initializes the auth state listener
 */
export function initAuthListener(): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    // If Firebase isn't configured, default to null session
    return () => {};
  }

  const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const provider = user.providerData?.[0]?.providerId || (user.isAnonymous ? 'anonymous' : 'custom');
      currentSession = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        isAnonymous: user.isAnonymous,
        providerId: provider,
      };
    } else {
      currentSession = null;
    }

    await syncSessionToLocalDb(currentSession);
    authListeners.forEach((fn) => fn(currentSession));
  });

  return unsubscribe;
}

export function subscribeAuthState(listener: AuthListener): () => void {
  authListeners.add(listener);
  listener(currentSession);
  return () => {
    authListeners.delete(listener);
  };
}

/**
 * 1-Tap Anonymous Sign-In (Recommended for offline-first hosts)
 */
export async function signInAnonymousUser(): Promise<UserSession> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase is not configured. Please add your credentials in .env.local or Settings.');
  }

  const result = await signInAnonymously(auth);
  const session: UserSession = {
    uid: result.user.uid,
    email: null,
    displayName: 'Anonymous Host',
    isAnonymous: true,
    providerId: 'anonymous',
  };
  currentSession = session;
  await syncSessionToLocalDb(session);
  authListeners.forEach((fn) => fn(session));
  return session;
}

/**
 * Sign in with Email & Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<UserSession> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase is not configured.');
  }

  const result = await signInWithEmailAndPassword(auth, email, pass);
  const session: UserSession = {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    isAnonymous: false,
    providerId: 'password',
  };
  currentSession = session;
  await syncSessionToLocalDb(session);
  authListeners.forEach((fn) => fn(session));
  return session;
}

/**
 * Sign up with Email & Password
 */
export async function signUpWithEmail(email: string, pass: string): Promise<UserSession> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase is not configured.');
  }

  const result = await createUserWithEmailAndPassword(auth, email, pass);
  const session: UserSession = {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    isAnonymous: false,
    providerId: 'password',
  };
  currentSession = session;
  await syncSessionToLocalDb(session);
  authListeners.forEach((fn) => fn(session));
  return session;
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<UserSession> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase is not configured.');
  }

  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const session: UserSession = {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    isAnonymous: false,
    providerId: 'google.com',
  };
  currentSession = session;
  await syncSessionToLocalDb(session);
  authListeners.forEach((fn) => fn(session));
  return session;
}

/**
 * Sign out of Firebase
 * Per docs/10-security-privacy.md, logging out does NOT delete local IndexedDB data!
 */
export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    await signOut(auth);
  }
  currentSession = null;
  await syncSessionToLocalDb(null);
  authListeners.forEach((fn) => fn(null));
}
