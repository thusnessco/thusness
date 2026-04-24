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
      <body className="thusness min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
