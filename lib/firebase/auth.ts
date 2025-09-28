// lib/firebase/auth.ts
import { auth } from "./clientApp";
import { GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGooglePopup() {
  const result = await signInWithPopup(auth, googleProvider);
  // result.user contains user info
  return result;
}

export async function signUpWithEmail(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred;
}

export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred;
}

export async function signOut() {
  await fbSignOut(auth);
}
