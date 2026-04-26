import type { Metadata } from "next";

import { SinkInExperience } from "./SinkInExperience";

export const metadata: Metadata = {
  title: "Sink in",
  description:
    "A timed, gentle read — Thusness sinking-in and deepening script.",
  robots: { index: false, follow: false },
};

export default function SinkInPage() {
  return <SinkInExperience />;
}
