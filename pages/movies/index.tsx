// import Button from "@/components/commons/Button";
// import { useRouter } from "next/router";
// import TrendingMovies from "@/components/TrendingMovies";

// const Home: React.FC = () => {
//   const router = useRouter();

//   return (
//     <div className="bg-[#171D22] text-white">
//       {/* Hero Section */}
//       <section
//         className="h-screen bg-cover bg-center"
//         style={{
//           backgroundImage:
//             'url("https://themebeyond.com/html/movflx/img/bg/breadcrumb_bg.jpg")',
//         }}
//       >
//         <div className="bg-black bg-opacity-50 h-full flex flex-col justify-center items-center text-center">
//           <h1 className="text-5xl md:text-7xl font-bold mb-8">
//             Discover Your Next Favorite{" "}
//             <span className="text-[#E2D609]">Movie</span>
//           </h1>
//           <p className="text-lg md:text-2xl mb-8 max-w-2xl">
//             Explore the latest blockbuster movies, critically acclaimed films,
//             and your personal favorites – all in one place.
//           </p>
//           <Button
//             title="Browse Movies"
//             action={() => router.push("/movies", undefined, { shallow: false })}
//           />
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-16 px-8 md:px-44 bg-[#121018] text-center">
//         <h2 className="text-3xl md:text-5xl font-semibold mb-8">
//           Vista Play Now!
//         </h2>
//         <p className="text-lg md:text-2xl mb-12">
//           Sign up today to get access to the latest movies, exclusive content,
//           and personalized movie recommendations.
//         </p>
//         <Button title="Get Started" />
//       </section>

//       {/* Trending Movies Section */}
//       <section className="py-16 px-8 md:px-16 bg-[#171D22]">
//         <h2 className="text-3xl md:text-5xl font-semibold mb-12 text-center">
//           Trending Movies
//         </h2>
//         <TrendingMovies />
//       </section>
//     </div>
//   );
// };

// export default Home;


// pages/movies.tsx
import React from "react";
import dynamic from "next/dynamic";
import Button from "@/components/commons/Button";
import Link from "next/link";

// Dynamically import TrendingMovies
const TrendingDebug = dynamic(() => import("@/components/TrendingMovies"), { ssr: false });

const MoviesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0E1113] text-white py-12 px-6 md:px-16">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bold">Movies</h1>
        <Link href="/" className="text-sm text-gray-300 hover:underline">Back to Home</Link>
      </header>

      {/* Optional top CTA */}
      <section className="mb-8">
        <p className="text-gray-300 mb-4">
          Browse trending movies, latest releases, and curated lists.
        </p>
        <div className="flex gap-3">
          <Button title="All Movies" action={() => { /* navigate or open filter */ }} />
        </div>
      </section>

      {/* Trending Movies */}
      <section>
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Trending Now</h2>
        <TrendingDebug />
      </section>
    </div>
  );
};

export default MoviesPage;
