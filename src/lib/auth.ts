// src/lib/auth.ts
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

/** Create account with Email/Password */
export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/** Login with Email/Password */
export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/** Logout current user */
export function logoutUser(): Promise<void> {
  return signOut(auth);
}

/** Observe auth changes; returns unsubscribe fn */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  const unsub = onAuthStateChanged(auth, callback);
  return unsub;
}
