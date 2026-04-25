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
  // Single source: `metadata.icons` only (no `app/favicon.ico`, no manual <head>
  // links) so Next does not merge duplicate favicon routes.
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
    ],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="thusness min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
