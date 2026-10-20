import Link from "next/link";
import { SITE } from "@/lib/site";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "/essays/", label: "Essays" },
  { href: "/notes/", label: "Notes" },
  { href: "/watch/", label: "Watch" },
  { href: "/projects/", label: "Projects" },
  { href: "/topics/", label: "Topics" },
] as const;

export function Masthead() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-6 gap-y-2 px-5 py-4">
        {/* The wordmark is the domain: `get dibs.io` types itself as a command, so
            there is no separate DIBS lockup sitting next to it. */}
        <Link href="/" className="no-underline" aria-label={`${SITE.name}, home`}>
          <Wordmark />
        </Link>
        <nav aria-label="Sections" className="ml-auto flex flex-wrap gap-x-5 gap-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-ui text-sm text-muted-foreground no-underline hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
