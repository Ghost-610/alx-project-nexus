// // pages/_document.tsx
// import { Html, Head, Main, NextScript } from "next/document";

// export default function Document() {
//   return (
//     <Html lang="en">
//       <Head>
//         {/* PWA Manifest */}
//         <link rel="manifest" href="/manifest.json" />

//         {/* Theme Color */}
//         <meta name="theme-color" content="#0070f3" />

//         {/* Add icons if needed */}
//         <link rel="icon" href="/icons/android-chrome-192x192.png" />
//         <link rel="apple-touch-icon" href="/icons/apple-icon-152x152.png" />
//         <meta name="msapplication-TileImage" content="/icons/ms-icon-310x310.png" />

//       </Head>
//       <body className="antialiased">
//         <Main />
//         <NextScript />
//       </body>
//     </Html>
//   );
// }

//the original one was commented out

// import { Html, Head, Main, NextScript } from "next/document";

// export default function Document() {
//   return (
//     <Html lang="en">
//       <Head>
//         <link rel="manifest" href="/manifest.json" />
//         <meta name="theme-color" content="#0070f3" />
//       </Head>
//       <body className="antialiased">
//         <Main />
//         <NextScript />
//       </body>
//     </Html>
//   );
// }



import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0070f3" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
