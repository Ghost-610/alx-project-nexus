// components/HeatButton.tsx
"use client";
import React, { useEffect, useState } from "react";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "../lib/firebase/clientApp";
import type { User } from "firebase/auth";

type Props = {
  movieId: string;
  user: User | null;
};

type MovieDoc = {
  heatCount?: number;
  // add other movie fields here if needed
};

const HeatButton: React.FC<Props> = ({ movieId, user }) => {
  const [isFav, setIsFav] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // check if this movie is in user's favorites
  useEffect(() => {
    let mounted = true;
    async function checkFav() {
      if (!user) {
        setIsFav(false);
        return;
      }
      try {
        const favDoc = doc(db, "users", user.uid, "favorites", movieId);
        const snap = await getDoc(favDoc);
        if (mounted) setIsFav(!!snap.exists());
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("checkFav error:", err);
        if (mounted) setIsFav(false);
      }
    }
    void checkFav();
    return () => {
      mounted = false;
    };
  }, [movieId, user]);

  const toggleFav = async () => {
    if (!user) {
      // Optionally prompt login
      // You might replace alert with a nicer UI flow
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
          const movieData = (movieSnap.exists() ? (movieSnap.data() as MovieDoc) : {}) ?? {};
          const current = typeof movieData.heatCount === "number" ? movieData.heatCount : 0;

          tx.set(favRef, { addedAt: Date.now(), movieId }); // lightweight timestamp; adjust if you prefer serverTimestamp
          tx.update(movieRef, { heatCount: current + 1 });
        });

        setIsFav(true);
      } else {
        // remove favorite and decrement heat count (avoid below zero)
        await runTransaction(db, async (tx) => {
          const movieSnap = await tx.get(movieRef);
          const movieData = (movieSnap.exists() ? (movieSnap.data() as MovieDoc) : {}) ?? {};
          const current = typeof movieData.heatCount === "number" ? movieData.heatCount : 0;

          tx.delete(favRef);
          tx.update(movieRef, { heatCount: Math.max(0, current - 1) });
        });

        setIsFav(false);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("toggleFav error:", err);
      // you may show a UI toast here
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={() => void toggleFav()}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm transition ${
        isFav ? "bg-[#F2AA4C] text-black" : "border border-gray-300 text-gray-700 bg-white"
      }`}
      aria-pressed={isFav === true}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={isFav ? "black" : "none"}
        stroke={isFav ? "black" : "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21s-7.5-4.5-9.2-6.2C1.1 12.8 2 8.8 5 6.9 7 5.5 9.5 6 12 8c2.5-2 5-2.5 7-1.1 3 1.9 3.9 5.9 2.2 8.9C19.5 16.5 12 21 12 21z" />
      </svg>
      <span>{isFav ? "Heated" : "Heat"}</span>
    </button>
  );
};

export default HeatButton;

