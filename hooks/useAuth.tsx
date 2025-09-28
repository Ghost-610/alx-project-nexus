// hooks/useAuth.tsx
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/clientApp";
import { useRouter } from "next/router";

/**
 * Named export for callers that use: import { useAuth } from "@/hooks/useAuth";
 * Default export for callers that use: import useAuth from "@/hooks/useAuth";
 */
export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signOut = async () => {
    try {
      setSigningOut(true);
      await auth.signOut();
      router.replace("/auth/login");
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      setSigningOut(false);
    }
  };

  return { user, loading, signingOut, signOut };
}

// default export for backward compatibility
export default useAuth;
