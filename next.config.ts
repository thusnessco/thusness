import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Legacy MDX-era redirects removed: they hijacked real TipTap slugs (e.g.
    // Legacy redirects removed (they hijacked real TipTap slugs).
    return [];
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
      {
        source: "/safari-pinned-tab.svg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
