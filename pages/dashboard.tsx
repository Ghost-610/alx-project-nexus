// pages/dashboard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth"; // named export
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/clientApp";
import type { User } from "firebase/auth";

type Movie = {
  id: string;
  title?: string;
  poster?: string;
  watchedAt?: any; // Firestore Timestamp or ISO string
  addedAt?: any;
};

const formatWatchedAt = (raw: any) => {
  if (!raw) return "";
  if (typeof raw === "object" && typeof raw.toDate === "function") {
    return raw.toDate().toLocaleString();
  }
  try {
    return new Date(raw).toLocaleString();
  } catch {
    return String(raw);
  }
};

const DashboardPage: React.FC = () => {
  const { user, loading, signingOut, signOut } = useAuth();
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [recent, setRecent] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    const uid = user.uid;
    if (!uid) return;

    let cancelled = false;
    setLoadingMovies(true);

    const loadLists = async () => {
      try {
        // favorites
        const favCol = collection(db, "users", uid, "favorites");
        const favSnap = await getDocs(favCol);
        const favs = favSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        if (!cancelled) setFavorites(favs);

        // recentlySeen (ordered by watchedAt desc)
        const recentCol = collection(db, "users", uid, "recentlySeen");
        const recentQuery = query(recentCol, orderBy("watchedAt", "desc"), limit(20));
        const recentSnap = await getDocs(recentQuery);
        const recents = recentSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        if (!cancelled) setRecent(recents);
      } catch (err) {
        console.error("Failed to load favorites/recently seen:", err);
      } finally {
        if (!cancelled) setLoadingMovies(false);
      }
    };

    loadLists();

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
            disabled={signingOut}
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Account info</h2>
          {user ? (
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <div>
                <strong>UID:</strong> {user.uid}
              </div>
              <div>
                <strong>Email:</strong> {user.email ?? "—"}
              </div>
              <div>
                <strong>Display name:</strong> {user.displayName ?? "—"}
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
                    <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      {m.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="w-full h-full object-cover"
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
                You haven't watched anything recently.
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
                    <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      {m.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="w-full h-full object-cover"
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
            <a href="/profile" className="px-3 py-1 rounded border text-sm">
              Profile
            </a>
            <a href="/settings" className="px-3 py-1 rounded border text-sm">
              Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
