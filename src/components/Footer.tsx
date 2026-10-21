import Link from "next/link";
import { SITE } from "@/lib/site";

const COLUMNS = [
  {
    title: "Read",
    links: [
      { href: "/essays/", label: "Essays" },
      { href: "/notes/", label: "Notes" },
      { href: "/watch/", label: "Watch" },
      { href: "/archive/", label: "Archive" },
    ],
  },
  {
    title: "Work",
    links: [
      { href: "/projects/", label: "Projects" },
      { href: "/topics/", label: "Topics" },
      { href: "/about/", label: "About" },
    ],
  },
  {
    title: "Follow",
    links: [
      { href: "/feed.xml", label: "RSS" },
      { href: "/feed.json", label: "JSON feed" },
      { href: "/llms.txt", label: "llms.txt" },
      { href: "/subscribe/", label: "Subscribe" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-20 bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 font-ui text-sm sm:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-3">
          <p className="m-0 font-display text-xl font-bold tracking-tight">
            <span className="text-background/65">$</span> get dibs<span className="text-background/65">.io</span>
          </p>
          <p className="m-0 max-w-xs text-background/65">{SITE.tagline}</p>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="eyebrow m-0 mb-3 !text-highlight">{column.title}</p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {column.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("/") && link.href.endsWith("/") ? (
                    <Link href={link.href} className="text-background/65 no-underline hover:text-highlight">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-background/65 no-underline hover:text-highlight">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-background/20">
        <p className="record mx-auto m-0 flex max-w-6xl flex-wrap justify-between gap-2 px-5 py-4 text-[0.6875rem] text-background/65">
          <span>
            © {new Date().getFullYear()} {SITE.author}
          </span>
          <span>
            markdown in git · static export ·{" "}
            <a href={SITE.repo} className="underline underline-offset-2 hover:text-highlight">
              source on github
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
}
