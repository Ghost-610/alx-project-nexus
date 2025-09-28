// components/TrendingDebug.tsx
"use client";
import React, { useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase/clientApp";

export default function TrendingDebug() {
  useEffect(() => {
    (async () => {
      try {
        console.log("🔎 TrendingDebug: db value:", db);
        const ref = collection(db, "movies");

        console.log("🔎 TrendingDebug: running getDocs for ALL (orderBy popularity)...");
        const qAll = query(ref, orderBy("popularity", "desc"), limit(5));
        const snapAll = await getDocs(qAll);
        console.log("✅ ALL snapshot size:", snapAll.size, "ids:", snapAll.docs.map(d => d.id));

        console.log("🔎 TrendingDebug: running getDocs for TRENDING (where trending==true)...");
        const qTrending = query(ref, where("trending", "==", true), orderBy("popularity", "desc"), limit(5));
        const snapTrend = await getDocs(qTrending);
        console.log("✅ TRENDING snapshot size:", snapTrend.size, "ids:", snapTrend.docs.map(d => d.id));
      } catch (err) {
        console.error("❌ TrendingDebug error:", err);
      }
    })();
  }, []);

  return <div className="p-4 text-sm text-gray-300">Check browser console for TrendingDebug output</div>;
}
