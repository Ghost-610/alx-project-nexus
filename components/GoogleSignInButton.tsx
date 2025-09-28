// components/GoogleSignInButton.tsx
"use client";
import React from "react";
import { signInWithGooglePopup } from "../lib/firebase/auth";
import { useRouter } from "next/router";

export default function GoogleSignInButton() {
  const router = useRouter();

  const onClick = async () => {
    try {
      await signInWithGooglePopup();
      router.replace("/dashboard"); // or stay on same page
    } catch (err) {
      console.error("Google sign-in error", err);
      alert("Google sign-in failed");
    }
  };

  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 px-4 py-2 rounded border">
      Sign in with Google
    </button>
  );
}
