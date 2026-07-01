import "server-only";

import {
  defaultGenerosityEssayContent,
  READINGS_GENEROSITY_SITE_KEY,
  type GenerosityEssayContent,
} from "@/lib/readings/generosity-essay";

export type GenerosityReadingBundle = {
  content: GenerosityEssayContent;
  updatedAt: string | null;
};

export { READINGS_GENEROSITY_SITE_KEY };

/** Plain-text essay — always from code so old structured DB rows cannot leak through. */
export async function getGenerosityReadingBundle(): Promise<GenerosityReadingBundle> {
  return {
    content: defaultGenerosityEssayContent(),
    updatedAt: null,
  };
}

export async function getGenerosityReadingBundleForAdmin(): Promise<GenerosityReadingBundle> {
  return getGenerosityReadingBundle();
}
