import type { Metadata } from "next";

import { ThusnessPageShell } from "@/components/thusness/ThusnessPageShell";
import { SiteFooter } from "@/components/thusness/SiteFooter";
import { LojongCompanion } from "./LojongCompanion";
import styles from "./lojong.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lojong · Thusness",
  description: "A companion for studying and applying mind training.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function LojongPage() {
  return (
    <ThusnessPageShell headerAside="Mind training">
      <main className={styles.companion} id="lojong-main">
        <LojongCompanion />
      </main>
      <SiteFooter />
    </ThusnessPageShell>
  );
}
