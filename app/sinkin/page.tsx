import type { Metadata } from "next";

import { getSinkInConfigBundle } from "@/lib/data/sinkin-config";

import { SinkInExperience } from "./SinkInExperience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sink in",
  description:
    "A timed, gentle read — Thusness sinking-in and deepening script.",
  robots: { index: false, follow: false },
};

export default async function SinkInPage() {
  const bundle = await getSinkInConfigBundle();
  return (
    <SinkInExperience
      key={bundle.updatedAt ?? "sinkin-default"}
      config={bundle.config}
    />
  );
}
