import { TiptapHtml } from "@/components/TiptapHtml";

import Link from "next/link";

import RedDot from "./RedDot";
import { ThusnessSiteBottomNav } from "./ThusnessSiteBottomNav";
import Wordmark from "./Wordmark";

const helv = 'Helvetica, "Helvetica Neue", Arial, sans-serif';

/**
 * Full-page public shell for TipTap HTML (home and notes).
 * Matches `.tiptap-html` in admin.
 */
export function HomePageFromTipTap({
  html,
  showBackgroundCircle = false,
}: {
  html: string;
  /** Large thin ring behind the article body (social-style framing). */
  showBackgroundCircle?: boolean;
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
        <header style={{ marginBottom: 56 }}>
          <Wordmark size={20} />
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

        <footer className="thusness-site-footer" style={{ marginTop: 80 }}>
          <ThusnessSiteBottomNav />
          <div
            className="thusness-site-footer__stripe flex items-center justify-between pt-5"
            style={{
              fontSize: 11,
              letterSpacing: 2,
              color: "var(--thusness-muted, #8a8672)",
              textTransform: "uppercase",
            }}
          >
            <Link
              href="/"
              className="text-[var(--thusness-muted)] transition-opacity hover:opacity-70"
            >
              thusness.co
            </Link>
            <RedDot />
          </div>
        </footer>
      </div>
    </div>
  );
}
