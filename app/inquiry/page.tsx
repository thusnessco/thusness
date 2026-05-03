import type { Metadata } from "next";

import { getInquiryConfigBundle } from "@/lib/data/inquiry-config";
import { InquiryExperience } from "./InquiryExperience";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const bundle = await getInquiryConfigBundle();
  const c = bundle.content;
  const title = `${c.pageTitle} · Thusness`;
  const description = c.pageSubtitle.trim() || "A simple way of looking · Thusness";
  return {
    title,
    description,
    openGraph: {
      title: c.pageTitle,
      description,
      url: "/inquiry",
      siteName: "Thusness",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: c.pageTitle,
      description,
    },
    robots: { index: false, follow: false },
  };
}

export default async function InquiryPage() {
  const bundle = await getInquiryConfigBundle();
  return (
    <InquiryExperience
      key={bundle.updatedAt ?? "inquiry-default"}
      content={bundle.content}
    />
  );
}
