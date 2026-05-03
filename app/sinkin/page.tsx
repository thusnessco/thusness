import type { Metadata } from "next";

import { getOrientNavVisible } from "@/lib/data/orient-nav";
import { getSinkInConfigBundle } from "@/lib/data/sinkin-config";

import { SinkInExperience } from "./SinkInExperience";

export const dynamic = "force-dynamic";

/** Short, stable copy for meta / OG / Telegram — not tied to on-page “Program title”. */
const LINK_PREVIEW_DESCRIPTION = "Sink in · Thusness";

export async function generateMetadata(): Promise<Metadata> {
  const description = LINK_PREVIEW_DESCRIPTION;

  return {
    title: "Sink in",
    description,
    /** Many apps read OG/Twitter first; keep in sync so unfurls match (and refresh after deploy). */
    openGraph: {
      title: "Sink in",
      description,
      url: "/sinkin",
      siteName: "Thusness",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Sink in",
      description,
    },
    robots: { index: false, follow: false },
  };
}

export default async function SinkInPage() {
  const [bundle, orientNavVisible] = await Promise.all([
    getSinkInConfigBundle(),
    getOrientNavVisible(),
  ]);
  return (
    <SinkInExperience
      key={bundle.updatedAt ?? "sinkin-default"}
      config={bundle.config}
      showOrientLink={orientNavVisible}
    />
  );
}
