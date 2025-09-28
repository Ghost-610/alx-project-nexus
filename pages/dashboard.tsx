// pages/dashboard.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth"; // named export
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/clientApp";
import type { Timestamp } from "firebase/firestore";

type FirestoreTime = Timestamp | string | number | null | undefined;

type Movie = {
  id: string;
  title?: string;
  poster?: string;
  watchedAt?: FirestoreTime;
  addedAt?: FirestoreTime;
};

const formatWatchedAt = (raw: FirestoreTime): string => {
  if (!raw) return "";
  // Firestore Timestamp
  if (typeof raw === "object" && raw !== null && typeof (raw as Timestamp).toDate === "function") {
    try {
      return (raw as Timestamp).toDate().toLocaleString();
    } catch {
      return String(raw);
    }
  }
  // string / number
  try {
    return new Date(raw as string | number).toLocaleString();
  } catch {
    return String(raw);
  }
};

const DashboardPage: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [recent, setRecent] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    const uid = user.id;
    if (!uid) return;

    let cancelled = false;
    setLoadingMovies(true);

    const loadLists = async () => {
      try {
        // favorites
        const favCol = collection(db, "users", uid, "favorites");
        const favSnap = await getDocs(favCol);
        const favs: Movie[] = favSnap.docs.map((d) => {
          const data = d.data() as Partial<Movie>;
          return {
            id: d.id,
            title: data.title,
            poster: data.poster,
            addedAt: data.addedAt as FirestoreTime,
          };
        });
        if (!cancelled) setFavorites(favs);

        // recentlySeen (ordered by watchedAt desc)
        const recentCol = collection(db, "users", uid, "recentlySeen");
        const recentQuery = query(recentCol, orderBy("watchedAt", "desc"), limit(20));
        const recentSnap = await getDocs(recentQuery);
        const recents: Movie[] = recentSnap.docs.map((d) => {
          const data = d.data() as Partial<Movie>;
          return {
            id: d.id,
            title: data.title,
            poster: data.poster,
            watchedAt: data.watchedAt as FirestoreTime,
          };
        });
        if (!cancelled) setRecent(recents);
      } catch (err) {
        // keep logging the error; don't throw
        // eslint-disable-next-line no-console
        console.error("Failed to load favorites/recently seen:", err);
      } finally {
        if (!cancelled) setLoadingMovies(false);
      }
    };

    void loadLists();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={() => void signOut()}
            className="px-3 py-1 rounded bg-red-50 text-red-700"
          >
            Sign out
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Account info</h2>
          {user ? (
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <div>
                <strong>UID:</strong> {user.id}
              </div>
              <div>
                <strong>Email:</strong> {user.email ?? "—"}
              </div>
              <div>
                <strong>Display name:</strong> {user.username ?? "—"}
              </div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-gray-500">No user data found.</div>
          )}
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <section>
            <h3 className="font-medium mb-2">Recently Watched</h3>
            {loadingMovies ? (
              <div>Loading...</div>
            ) : recent.length ? (
              <ul className="space-y-3">
                {recent.map((m) => (
                  <li key={m.id} className="flex items-center gap-3">
                    <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0 relative">
                      {m.poster ? (
                        <Image
                          src={m.poster}
                          alt={m.title ?? "Movie poster"}
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                          No image
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{m.title ?? "Untitled"}</div>
                      <div className="text-xs text-gray-500">
                        {formatWatchedAt(m.watchedAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">
                You haven&#39;t watched anything recently.
              </div>
            )}
          </section>

          <section>
            <h3 className="font-medium mb-2">Favorites</h3>
            {loadingMovies ? (
              <div>Loading...</div>
            ) : favorites.length ? (
              <ul className="space-y-3">
                {favorites.map((m) => (
                  <li key={m.id} className="flex items-center gap-3">
                    <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0 relative">
                      {m.poster ? (
                        <Image
                          src={m.poster}
                          alt={m.title ?? "Movie poster"}
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                          No image
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{m.title ?? "Untitled"}</div>
                      <div className="text-xs text-gray-500">
                        Added: {formatWatchedAt(m.addedAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">No favorites yet.</div>
            )}
          </section>
        </div>

        <div className="mt-6">
          <h3 className="font-medium">Quick actions</h3>
          <div className="mt-2 flex gap-2">
            <Link href="/profile" className="px-3 py-1 rounded border text-sm">
              Profile
            </Link>
            <Link href="/settings" className="px-3 py-1 rounded border text-sm">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
