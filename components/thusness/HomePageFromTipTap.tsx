import { TiptapHtml } from "@/components/TiptapHtml";

import RedDot from "./RedDot";
import Wordmark from "./Wordmark";

const helv = 'Helvetica, "Helvetica Neue", Arial, sans-serif';

/**
 * Full-page public shell for TipTap HTML (home and notes).
 * Matches `.tiptap-html` in admin.
 */
export function HomePageFromTipTap({ html }: { html: string }) {
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

        <TiptapHtml
          html={html}
          className="tiptap-html mx-auto max-w-[620px] text-[17px] leading-[1.7] text-[var(--thusness-ink-soft)]"
        />

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
