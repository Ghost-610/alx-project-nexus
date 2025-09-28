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
import { db } from "@/lib/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";

type MovieData = {
  title?: string;
  poster?: string | null;
  synopsis?: string;
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

function serializeFirestoreValue(value: any): any {
  // Firestore Timestamp has toDate()
  if (value && typeof value === "object" && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  // If it's a plain JS Date
  if (value instanceof Date) {
    return value.toISOString();
  }
  // otherwise return as-is (string, number, boolean, null)
  return value;
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
      <img
        src={movie.poster ?? "/placeholder-movie.png"}
        alt={movie.title ?? "Poster"}
        className="rounded-lg mb-4 w-full max-w-xs"
      />
      <p className="text-gray-300">{movie.synopsis ?? "No synopsis available."}</p>

      <div className="text-sm text-gray-500 mt-4">
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
  const { id } = context.params as { id: string };

  try {
    const ref = doc(db, "movies", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return { props: { id, movie: null } };
    }

    const raw = snap.data() as Record<string, any>;
    // Build a serializable object
    const movie: MovieData = {
      title: raw.title ?? null,
      poster: raw.poster ?? null,
      synopsis: raw.synopsis ?? null,
      popularity: typeof raw.popularity === "number" ? raw.popularity : Number(raw.popularity ?? 0),
      tmdbId: raw.tmdbId ? Number(raw.tmdbId) : undefined,
      voteAverage: raw.voteAverage ? Number(raw.voteAverage) : undefined,
      voteCount: raw.voteCount ? Number(raw.voteCount) : undefined,
      heatCount: raw.heatCount ? Number(raw.heatCount) : undefined,
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
    console.error("Error fetching movie:", error);
    return { props: { id, movie: null } };
  }
};
