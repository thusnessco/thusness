import type { Metadata } from "next";

import { getSinkInConfigBundle } from "@/lib/data/sinkin-config";

import { SinkInExperience } from "./SinkInExperience";

export const dynamic = "force-dynamic";

const META_DESC_MAX = 158;

export async function generateMetadata(): Promise<Metadata> {
  const bundle = await getSinkInConfigBundle();
  const raw = bundle.config.programTitle.trim();
  const description =
    raw.length > 0
      ? raw.length <= META_DESC_MAX
        ? raw
        : `${raw.slice(0, META_DESC_MAX - 1)}…`
      : "Sink in · Thusness";

  return {
    title: "Sink in",
    description,
    robots: { index: false, follow: false },
  };
}

export default async function SinkInPage() {
  const bundle = await getSinkInConfigBundle();
  return (
    <SinkInExperience
      key={bundle.updatedAt ?? "sinkin-default"}
      config={bundle.config}
    />
  );
}
