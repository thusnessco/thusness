import type { NextConfig } from "next";

/** MDX-era `/notes/[slug]` paths (frontmatter `slug` or filename) → archive index. */
const LEGACY_NOTE_SLUG_REDIRECTS: { source: string }[] = [
  { source: "/notes/noticing" },
  { source: "/notes/resistance" },
  { source: "/notes/noticing-effort" },
  { source: "/notes/2026-04-10-noticing" },
  { source: "/notes/2026-04-17-resistance" },
  { source: "/notes/2026-04-20-noticing-effort" },
];

const nextConfig: NextConfig = {
  async redirects() {
    return LEGACY_NOTE_SLUG_REDIRECTS.map(({ source }) => ({
      source,
      destination: "/notes",
      permanent: true,
    }));
  },

  async headers() {
    return [
      {
        source: "/favicon.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, immutable" },
        ],
      },
      {
        source: "/favicon-32.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, immutable" },
        ],
      },
      {
        source: "/apple-touch-icon.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
