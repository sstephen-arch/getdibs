import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-4 px-5 py-8 font-ui text-sm text-muted-foreground">
        <p className="m-0">
          {SITE.tagline}
        </p>
        <nav aria-label="Elsewhere" className="flex gap-5">
          <Link href="/about/" className="no-underline hover:text-foreground">About</Link>
          <Link href="/subscribe/" className="no-underline hover:text-foreground">Subscribe</Link>
          <a href="/feed.xml" className="no-underline hover:text-foreground">RSS</a>
        </nav>
      </div>
    </footer>
  );
}
