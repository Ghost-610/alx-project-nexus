// // client: increment movie view (pages/movies/[id].tsx)
// import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
// import { db } from "@/lib/firebase/clientApp";

// export async function incrementMovieView(movieId: string) {
//   const movieRef = doc(db, "movies", movieId);

//   try {
//     await runTransaction(db, async (tx) => {
//       const snap = await tx.get(movieRef);
//       if (!snap.exists()) {
//         // create minimal doc if missing
//         tx.set(movieRef, {
//           views: 1,
//           heatCount: 1,
//           updatedAt: serverTimestamp(),
//         }, { merge: true });
//         return;
//       }
//       const data = snap.data();
//       const newViews = (data.views ?? 0) + 1;
//       const newHeat = (data.heatCount ?? 0) + 1; // simple heat increment
//       tx.update(movieRef, {
//         views: newViews,
//         heatCount: newHeat,
//         updatedAt: serverTimestamp(),
//       });
//     });
//   } catch (err) {
//     console.error("incrementMovieView failed:", err);
//   }
// }

// pages/movies/[id].tsx
import React from "react";
import type { GetServerSideProps } from "next";
import Image from "next/image";
import { db } from "@/lib/firebase/clientApp";
import { doc, getDoc, DocumentData, Timestamp } from "firebase/firestore";

type MovieData = {
  title?: string | null;
  poster?: string | null;
  synopsis?: string | null;
  popularity?: number;
  tmdbId?: number;
  voteAverage?: number;
  voteCount?: number;
  heatCount?: number;
  trending?: boolean;
  updatedAt?: string | null; // serialized as ISO string
};

type MoviePageProps = {
  id: string;
  movie: MovieData | null;
};

function serializeFirestoreValue(value: unknown): string | null {
  // Firestore Timestamp has toDate()
  if (value && typeof value === "object" && "toDate" in (value as object)) {
    const maybeTs = value as Timestamp;
    if (typeof maybeTs.toDate === "function") {
      return maybeTs.toDate().toISOString();
    }
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string" || typeof value === "number") {
    try {
      const d = new Date(value as string | number);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    } catch {
      // fallthrough
    }
    return String(value);
  }

  return null;
}

const MoviePage: React.FC<MoviePageProps> = ({ id, movie }) => {
  if (!movie) {
    return (
      <div className="p-6 text-center text-gray-400">
        Movie not found
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{movie.title}</h1>

      <div className="mb-4 w-full max-w-xs">
        <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={movie.poster ?? "/placeholder-movie.png"}
            alt={movie.title ?? "Poster"}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 640px) 100vw, 300px"
            priority={false}
          />
        </div>
      </div>

      <p className="text-gray-300">{movie.synopsis ?? "No synopsis available."}</p>

      <div className="text-sm text-gray-500 mt-4 space-y-1">
        <div>Popularity: {movie.popularity ?? 0}</div>
        <div>Votes: {movie.voteCount ?? 0} (avg {movie.voteAverage ?? 0})</div>
        <div>Heat: {movie.heatCount ?? 0}</div>
        <div>Trending: {movie.trending ? "Yes" : "No"}</div>
        <div>Updated at: {movie.updatedAt ?? "—"}</div>
      </div>
    </div>
  );
};

export default MoviePage;

export const getServerSideProps: GetServerSideProps<MoviePageProps> = async (context) => {
  const params = context.params as { id?: string } | undefined;
  const id = params?.id ?? "";

  if (!id) {
    return { props: { id: "", movie: null } };
  }

  try {
    const ref = doc(db, "movies", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return { props: { id, movie: null } };
    }

    const raw = snap.data() as DocumentData;

    const movie: MovieData = {
      title: (raw.title ?? null) as string | null,
      poster: (raw.poster ?? null) as string | null,
      synopsis: (raw.synopsis ?? null) as string | null,
      popularity:
        typeof raw.popularity === "number"
          ? raw.popularity
          : Number(raw.popularity ?? 0),
      tmdbId: raw.tmdbId != null ? Number(raw.tmdbId) : undefined,
      voteAverage: raw.voteAverage != null ? Number(raw.voteAverage) : undefined,
      voteCount: raw.voteCount != null ? Number(raw.voteCount) : undefined,
      heatCount: raw.heatCount != null ? Number(raw.heatCount) : undefined,
      trending: typeof raw.trending === "boolean" ? raw.trending : Boolean(raw.trending),
      updatedAt: raw.updatedAt ? serializeFirestoreValue(raw.updatedAt) : null,
    };

    return {
      props: {
        id,
        movie,
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching movie:", error);
    return { props: { id, movie: null } };
  }
};
