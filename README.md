# ALX Movie App

A full-stack movie discovery and trending platform built with [Next.js](https://nextjs.org), Firebase, and The Movie Database (TMDB) API. Users can browse trending movies, view detailed information, register/login, and favorite ("heat") movies to influence their popularity.

---

## Features

- **Trending Movies:** Displays a list of trending movies fetched from TMDB.
- **Movie Details:** View detailed information about each movie, including poster, synopsis, popularity, votes, and trending status.
- **User Authentication:** Register and log in with email/password or social providers (Google, Facebook).
- **Favorites ("Heat") System:** Authenticated users can favorite movies, increasing their "heat" count.
- **Real-time Updates:** Movie data and heat counts are stored and updated in Firebase Firestore.
- **Dashboard:** Users can view their favorite and recently watched movies.
- **Server-side Rendering:** Movie pages are rendered server-side for SEO and performance.

---

## How It Works

1. **Data Fetching:**
   - Trending movies are fetched from [TMDB API](https://www.themoviedb.org/documentation/api) via the `/api/sync-tmdb` endpoint.
   - Movie data is stored in [Firebase Firestore](https://firebase.google.com/docs/firestore).
   - The app uses Firestore as its main database for movies, user profiles, and favorites.

2. **Authentication:**
   - Users can register and log in using email/password or social providers.
   - Authentication is handled via [Firebase Auth](https://firebase.google.com/docs/auth).

3. **Favorites & Heat:**
   - When a user favorites a movie, a record is created in their Firestore user document and the movie's `heatCount` is incremented atomically.
   - Unfavoriting decrements the `heatCount`.

4. **Movie Pages:**
   - Each movie has a dedicated page (`/movies/[id]`) rendered with server-side data from Firestore.
   - Movie details include title, poster, synopsis, popularity, votes, heat count, trending status, and last update time.

5. **Dashboard:**
   - Authenticated users can access a dashboard to see their favorite and recently watched movies.

---

## Data Sources

- **TMDB API:**  
  Movie metadata (title, poster, synopsis, popularity, etc.) is fetched from TMDB using the `/api/sync-tmdb` API route.  
  Requires a TMDB API key set in `.env.local` as `TMDB_KEY`.

- **Firebase Firestore:**  
  All persistent data (movies, users, favorites, heat counts) is stored in Firestore.  
  Firebase configuration is set in `.env.local` and initialized in [`lib/firebase/clientApp.ts`](lib/firebase/clientApp.ts).

---

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/your-username/alx-movie-app.git
cd alx-movie-app