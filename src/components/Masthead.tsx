import Link from "next/link";
import { SITE } from "@/lib/site";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "/essays/", label: "Essays", section: "essays" },
  { href: "/notes/", label: "Notes", section: "notes" },
  { href: "/watch/", label: "Watch", section: "watch" },
  { href: "/projects/", label: "Projects", section: "projects" },
  { href: "/topics/", label: "Topics", section: "topics" },
] as const;

export type Section = (typeof NAV)[number]["section"];

/** White, sticky and ruled off from the page, as on Depalo, so the paper below
 *  reads as the page and the bar reads as furniture. */
export function Masthead({ section }: { section?: Section }) {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
        {/* The wordmark is the domain: `get dibs.io` types itself as a command, so
            there is no separate DIBS lockup sitting next to it. */}
        <Link href="/" className="no-underline" aria-label={`${SITE.name}, home`}>
          <Wordmark />
        </Link>
        <nav aria-label="Sections" className="-mx-2 flex w-full flex-wrap gap-1 sm:mx-0 sm:ml-auto sm:w-auto">
          {NAV.map((item) => {
            const current = item.section === section;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "true" : undefined}
                className={`rounded-control px-2.5 py-1.5 font-ui text-sm font-medium no-underline transition-colors ${
                  current
                    ? "bg-foreground text-background"
                    : "text-foreground hover:bg-highlight"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
