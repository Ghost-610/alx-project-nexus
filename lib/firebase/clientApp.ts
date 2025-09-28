// // lib/firebase/clientApp.ts
// import { initializeApp, getApps, getApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };

// function initFirebase() {
//   try {
//     if (!getApps().length) {
//       initializeApp(firebaseConfig);
//     } else {
//       getApp();
//     }
//   } catch (err) {
//     // silent
//   }
// }

// initFirebase();

// export const auth = getAuth();
// export const db = getFirestore();
//old code

// lib/firebase/clientApp.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase config (from your Firebase console).
 * This file uses the explicit values you provided so you can copy+paste and test immediately.
 * Later you can move these into .env.local and reference process.env.NEXT_PUBLIC_FIREBASE_*
 */
const firebaseConfig = {
  apiKey: "AIzaSyBUkG4yZSUVE-sfq6PIsj1JssK0sMwVOQM",
  authDomain: "vista-play-movie-app.firebaseapp.com",
  projectId: "vista-play-movie-app",
  storageBucket: "vista-play-movie-app.firebasestorage.app",
  messagingSenderId: "583624681045",
  appId: "1:583624681045:web:875b0a156e3ae99af816dc",
  measurementId: "G-ZTE73DBMJ0",
};

// Initialize app only once (prevents double-init during HMR)
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Export the initialized services
export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;



// code from Firebase console, adjusted for clarity and ease of use.

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBUkG4yZSUVE-sfq6PIsj1JssK0sMwVOQM",
//   authDomain: "vista-play-movie-app.firebaseapp.com",
//   projectId: "vista-play-movie-app",
//   storageBucket: "vista-play-movie-app.firebasestorage.app",
//   messagingSenderId: "583624681045",
//   appId: "1:583624681045:web:875b0a156e3ae99af816dc",
//   measurementId: "G-ZTE73DBMJ0"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);