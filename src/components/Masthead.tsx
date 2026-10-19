import Link from "next/link";
import { SITE } from "@/lib/site";

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
        <Link href="/" className="flex items-baseline gap-3 no-underline">
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            {SITE.name}
          </span>
          {/* The domain is part of the design, not something to work around. */}
          <span className="record text-xs text-muted-foreground">{SITE.domain}</span>
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
