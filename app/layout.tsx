import type { Metadata } from "next";

import "./globals.css";

function metadataBaseUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    try {
      return new URL(explicit);
    } catch {
      /* fall through */
    }
  }
  // Avoid *.vercel.app as metadataBase in production — absolute OG/icon URLs would
  // point at Vercel’s host and the tab icon can show Vercel’s default on custom domains.
  if (process.env.VERCEL_ENV === "production") {
    const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (host) {
      try {
        const normalized = host.replace(/^https?:\/\//, "").replace(/\/$/, "");
        if (normalized) return new URL(`https://${normalized}`);
      } catch {
        /* fall through */
      }
    }
    return new URL("https://thusness.co");
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: "Thusness",
  description:
    "A quiet hour of guided noticing — small groups, one-on-one, and ongoing guidance.",
  // `app/icon.svg` + `app/apple-icon.tsx` — RedDot (footer) motif.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Same-origin paths so the tab icon works on thusness.co even when
            NEXT_PUBLIC_SITE_URL is unset (metadata alone used vercel.app before). */}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link rel="shortcut icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon" />
      </head>
      <body className="thusness min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
