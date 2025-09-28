// components/TrendingMovies.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/clientApp";
import HeatButton from "@/components/HeatButton";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";

type Movie = {
  id: string;
  title?: string | null;
  poster?: string | null;
  synopsis?: string | null;
  popularity?: number;
  heatCount?: number;
  trending?: boolean;
};

const PAGE_LIMIT = 12;

const TrendingMovies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [debugDocs, setDebugDocs] = useState<Array<{ id: string; data: Record<string, unknown> }>>([]);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const fetchTrending = async () => {
      setLoading(true);
      setError(null);
      setInfo(null);
      setDebugDocs([]);

      if (!db) {
        setError("Firestore is not initialized (db is undefined). Check lib/firebase/clientApp.ts");
        setLoading(false);
        return;
      }

      try {
        const moviesRef = collection(db, "movies");

        // Preferred query: trending == true + orderBy popularity
        const qPreferred = query(
          moviesRef,
          where("trending", "==", true),
          orderBy("popularity", "desc"),
          limit(PAGE_LIMIT)
        );

        console.log("[TrendingMovies] Running preferred query (where trending==true, orderBy popularity desc)");
        const snap = await getDocs(qPreferred);
        console.log("[TrendingMovies] preferred snapshot:", {
          size: snap.size,
          docs: snap.docs.map((d) => ({ id: d.id, data: d.data() })),
        });

        // If the preferred snapshot returned docs, use them
        if (!cancelled && !snap.empty) {
          const docs: Movie[] = snap.docs.map((d) => {
            const raw = d.data() as Record<string, unknown>;
            return {
              id: d.id,
              title: (raw.title as string) ?? null,
              poster: (raw.poster as string) ?? null,
              synopsis: (raw.synopsis as string) ?? null,
              popularity: typeof raw.popularity === "number" ? raw.popularity : Number(raw.popularity ?? 0),
              heatCount: typeof raw.heatCount === "number" ? raw.heatCount : Number(raw.heatCount ?? 0),
              trending: typeof raw.trending === "boolean" ? raw.trending : Boolean(raw.trending),
            };
          });
          setMovies(docs);
          setDebugDocs(snap.docs.map((d) => ({ id: d.id, data: d.data() as Record<string, unknown> })));
          setInfo(`Using ${snap.size} document(s) from preferred query (trending==true).`);
          setLoading(false);
          return;
        }

        // Fallback: top popular movies (ignores trending)
        console.warn("[TrendingMovies] preferred query empty — falling back to top popular movies.");
        const qFallback = query(moviesRef, orderBy("popularity", "desc"), limit(PAGE_LIMIT));
        const snapFallback = await getDocs(qFallback);
        console.log("[TrendingMovies] fallback snapshot:", {
          size: snapFallback.size,
          docs: snapFallback.docs.map((d) => ({ id: d.id, data: d.data() })),
        });

        if (!cancelled) {
          const docs: Movie[] = snapFallback.docs.map((d) => {
            const raw = d.data() as Record<string, unknown>;
            return {
              id: d.id,
              title: (raw.title as string) ?? null,
              poster: (raw.poster as string) ?? null,
              synopsis: (raw.synopsis as string) ?? null,
              popularity: typeof raw.popularity === "number" ? raw.popularity : Number(raw.popularity ?? 0),
              heatCount: typeof raw.heatCount === "number" ? raw.heatCount : Number(raw.heatCount ?? 0),
              trending: typeof raw.trending === "boolean" ? raw.trending : Boolean(raw.trending),
            };
          });
          setMovies(docs);
          setDebugDocs(snapFallback.docs.map((d) => ({ id: d.id, data: d.data() as Record<string, unknown> })));
          setInfo(
            snapFallback.empty
              ? "No documents found in `movies` collection."
              : `No docs with trending==true. Showing top ${snapFallback.size} popular movies instead.`
          );
          setLoading(false);
        }
      } catch (err: unknown) {
        // Normalize error to string safely
        console.error("[TrendingMovies] fetch error:", err);
        const msg =
          typeof err === "object" && err !== null && "message" in err
            ? String((err as { message?: unknown }).message ?? "")
            : String(err);

        if (msg.includes("permission-denied") || msg.includes("PERMISSION_DENIED")) {
          setError("Permission denied: Firestore rules are blocking reads.");
        } else if (msg.includes("failed-precondition") || msg.includes("index")) {
          setError("Firestore requires a composite index for this query (where + orderBy). Check browser console for index link.");
        } else {
          setError(msg || "Unknown error fetching trending movies.");
        }
        setLoading(false);
      }
    };

    void fetchTrending();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-sm text-gray-400 mb-4">Loading trending movies...</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 rounded-lg h-56" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-sm text-red-500 break-words">{error}</div>;
  }

  if (!movies.length) {
    return <div className="p-6 text-center text-sm text-gray-500">No trending movies available.</div>;
  }

  return (
    <div className="p-0">
      {info && (
        <div className="mb-4 text-center text-xs text-amber-300/90">
          {info}
        </div>
      )}

      {/* Debug preview (visible in UI) - shows first 3 docs returned for quick inspection */}
      {debugDocs.length > 0 && (
        <div className="mb-4 p-3 bg-black/20 rounded text-xs text-gray-300">
          <div className="font-medium text-sm mb-2">Debug: first returned documents</div>
          <pre className="max-h-44 overflow-auto text-xs">
            {JSON.stringify(debugDocs.slice(0, 3), null, 2)}
          </pre>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((m) => (
          <article key={m.id} className="bg-white/5 rounded-lg overflow-hidden shadow-sm">
            <div className="relative">
              <Image
                src={m.poster ?? "/placeholder-movie.png"}
                alt={m.title ?? "Movie poster"}
                width={400}
                height={224}
                className="w-full h-56 object-cover"
                loading="lazy"
              />

              <div className="absolute top-2 right-2">
                <HeatButton movieId={m.id} user={user as import("firebase/auth").User | null} />
              </div>
            </div>

            <div className="p-3">
              <h3 className="font-semibold text-lg text-white">{m.title ?? "Untitled"}</h3>
              <p className="text-sm text-gray-300 line-clamp-3 mt-1">{m.synopsis ?? ""}</p>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-400">Popularity: {m.popularity ?? 0}</div>
                <Link href={`/movies/${m.id}`} className="text-xs border px-3 py-1 rounded text-amber-400 hover:bg-amber-400/10">
                  View
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default TrendingMovies;
