// hooks/useAuth.ts
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type User = { id: string; username?: string; email?: string } | null;

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const u = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    setToken(t);
    setUser(u ? JSON.parse(u) : null);
    setLoading(false);

    if (!t || !u) {
      // if you want to redirect only when not on auth pages, you can gate this
      router.replace("/auth/login");
    }
  }, [router]);

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return { user, token, loading, signOut };
};
