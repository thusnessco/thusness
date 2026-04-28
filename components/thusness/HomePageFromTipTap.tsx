import Link from "next/link";
import { TiptapHtml } from "@/components/TiptapHtml";

import RedDot from "./RedDot";
import Wordmark from "./Wordmark";

const helv = 'Helvetica, "Helvetica Neue", Arial, sans-serif';

/**
 * Full-page public shell for TipTap HTML (home and notes).
 * Matches `.tiptap-html` in admin.
 */
export function HomePageFromTipTap({
  html,
  showBackgroundCircle = false,
  showOrientLink = true,
}: {
  html: string;
  /** Large thin ring behind the article body (social-style framing). */
  showBackgroundCircle?: boolean;
  /** Subtle top-right public link to /orient. */
  showOrientLink?: boolean;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--thusness-bg, #efece1)",
        color: "var(--thusness-ink, #1a1915)",
        fontFamily: helv,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "48px 40px 96px" }}>
        <header
          style={{ marginBottom: 56 }}
          className="flex items-start justify-between gap-6"
        >
          <Wordmark size={20} />
          {showOrientLink ? (
            <Link
              href="/orient"
              className="pt-1 text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)] transition-opacity hover:opacity-70"
            >
              Orient
            </Link>
          ) : null}
        </header>

        <div
          style={{
            position: "relative",
            margin: "0 auto",
            maxWidth: 620,
            isolation: "isolate",
          }}
        >
          {showBackgroundCircle ? (
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: "-12px",
                width: "min(88vw, 520px)",
                height: "min(88vw, 520px)",
                maxWidth: "100%",
                borderRadius: "50%",
                boxSizing: "border-box",
                border: "1px solid rgba(74, 68, 52, 0.35)",
                background: "transparent",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
          ) : null}
          <TiptapHtml
            html={html}
            className="tiptap-html relative z-[1] mx-auto max-w-[620px] text-[17px] leading-[1.7] text-[var(--thusness-ink-soft)]"
          />
        </div>

        <footer
          style={{
            marginTop: 80,
            paddingTop: 24,
            borderTop: "1px solid var(--thusness-rule, #c7c2b0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11,
            letterSpacing: 2,
            color: "var(--thusness-muted, #8a8672)",
            textTransform: "uppercase",
          }}
        >
          <span>thusness.co</span>
          <RedDot />
        </footer>
      </div>
    </div>
  );
}
