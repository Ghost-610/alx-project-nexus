// components/HeatButton.tsx
"use client";
import React, { useEffect, useState } from "react";
import { doc, setDoc, deleteDoc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase/clientApp";
import { User } from "firebase/auth";

type Props = {
  movieId: string;
  currentHeat?: number;
  user: User | null;
};

const HeatButton: React.FC<Props> = ({ movieId, currentHeat = 0, user }) => {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  // check if this movie is in user's favorites
  useEffect(() => {
    let mounted = true;
    async function checkFav() {
      if (!user) {
        setIsFav(false);
        return;
      }
      const favDoc = doc(db, "users", user.uid, "favorites", movieId);
      const snap = await getDoc(favDoc);
      if (mounted) setIsFav(!!snap.exists());
    }
    checkFav();
    return () => {
      mounted = false;
    };
  }, [movieId, user]);

  const toggleFav = async () => {
    if (!user) {
      // Optionally prompt login
      alert("Please sign in to add favorites.");
      return;
    }

    setLoading(true);
    try {
      const movieRef = doc(db, "movies", movieId);
      const favRef = doc(db, "users", user.uid, "favorites", movieId);

      if (!isFav) {
        // add favorite and increment heat count atomically
        await runTransaction(db, async (tx) => {
          const movieSnap = await tx.get(movieRef);
          const current = movieSnap.exists() ? (movieSnap.data() as any).heatCount ?? 0 : 0;
          tx.set(favRef, { addedAt: serverTimestamp(), movieId });
          tx.update(movieRef, { heatCount: current + 1 });
        });
        setIsFav(true);
      } else {
        // remove favorite and decrement heat count (avoid below zero)
        await runTransaction(db, async (tx) => {
          const movieSnap = await tx.get(movieRef);
          const current = movieSnap.exists() ? (movieSnap.data() as any).heatCount ?? 0 : 0;
          tx.delete(favRef);
          tx.update(movieRef, { heatCount: Math.max(0, current - 1) });
        });
        setIsFav(false);
      }
    } catch (err) {
      console.error("toggleFav error:", err);
      // show friendly message
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFav}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm transition ${
        isFav ? "bg-[#F2AA4C] text-black" : "border border-gray-300 text-gray-700 bg-white"
      }`}
      aria-pressed={isFav}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={isFav ? "black" : "none"} stroke={isFav ? "black" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7.5-4.5-9.2-6.2C1.1 12.8 2 8.8 5 6.9 7 5.5 9.5 6 12 8c2.5-2 5-2.5 7-1.1 3 1.9 3.9 5.9 2.2 8.9C19.5 16.5 12 21 12 21z" />
      </svg>
      <span>{isFav ? "Heated" : "Heat"}</span>
    </button>
  );
};

export default HeatButton;
