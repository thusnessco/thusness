import Link from "next/link";

/** Top-right caps links: optional Orient map, always Sink in as “Notice”. */
export function SiteHeaderNav({ showOrientLink }: { showOrientLink: boolean }) {
  return (
    <nav
      className="flex items-center justify-end gap-5"
      aria-label="Top navigation"
    >
      {showOrientLink ? (
        <Link href="/orient" className="transition-opacity hover:opacity-70">
          Orient
        </Link>
      ) : null}
      <Link href="/sinkin" className="transition-opacity hover:opacity-70">
        Notice
      </Link>
    </nav>
  );
}
