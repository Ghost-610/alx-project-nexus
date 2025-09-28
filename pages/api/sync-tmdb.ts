// pages/api/sync-tmdb.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase/clientApp";
import { doc, setDoc, serverTimestamp, writeBatch } from "firebase/firestore";

const TMDB_KEY = process.env.TMDB_KEY;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

type TMDBMovie = {
  id?: number | string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  title?: string | null;
  name?: string | null;
  overview?: string | null;
  popularity?: number | string | null;
  vote_average?: number | string | null;
  vote_count?: number | string | null;
  heatCount?: number | string | null;
};

type MoviePayload = {
  title: string;
  tmdbId: number;
  synopsis: string;
  poster: string | null;
  backdrop: string | null;
  popularity: number;
  voteAverage: number;
  voteCount: number;
  heatCount: number;
  trending: boolean;
  updatedAt: ReturnType<typeof serverTimestamp>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!TMDB_KEY) {
    return res.status(500).json({ error: "TMDB_KEY is not configured in .env.local" });
  }

  try {
    // fetch trending movies (day)
    const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_KEY}&language=en-US`;
    const r = await fetch(url);
    if (!r.ok) {
      const txt = await r.text();
      return res.status(500).json({ error: "TMDB fetch failed", details: txt });
    }

    const json = (await r.json()) as { results?: TMDBMovie[] } | unknown;
    const results = Array.isArray((json as { results?: TMDBMovie[] })?.results)
      ? (json as { results?: TMDBMovie[] }).results!
      : ([] as TMDBMovie[]);

    const TOP_N = 12;
    const topN = results.slice(0, TOP_N).map((m) => Number(m.id ?? 0));

    // Use a batch for writes (safer + faster). If you have >500 items you'd chunk, but TMDB returns limited items.
    const batch = writeBatch(db);

    results.forEach((movie: TMDBMovie) => {
      const id = String(movie.id ?? "");
      const ref = doc(db, "movies", id);

      const poster = movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null;
      const backdrop = movie.backdrop_path ? `${TMDB_IMAGE_BASE}/w780${movie.backdrop_path}` : null;

      const payload: MoviePayload = {
        title: String(movie.title ?? movie.name ?? ""),
        tmdbId: Number(movie.id ?? 0),
        synopsis: String(movie.overview ?? ""),
        poster,
        backdrop,
        popularity: Number(movie.popularity ?? 0),
        voteAverage: Number(movie.vote_average ?? 0),
        voteCount: Number(movie.vote_count ?? 0),
        heatCount: Number(movie.heatCount ?? 0),
        trending: topN.includes(Number(movie.id ?? 0)),
        updatedAt: serverTimestamp(),
      };

      // Use merge to only update provided fields
      batch.set(ref, payload, { merge: true });
    });

    await batch.commit();

    return res.status(200).json({ ok: true, imported: results.length, top: topN.length });
  } catch (err) {
    console.error("sync-tmdb error:", err);
    return res.status(500).json({ error: String(err) });
  }
}
