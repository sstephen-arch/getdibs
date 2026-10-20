import Link from "next/link";
import type { Entry } from "@/content/load";
import { entryPath } from "@/content/routes";
import { formatWhen, readingMinutes } from "@/lib/format";
import { SITE } from "@/lib/site";
import { Kicker } from "./KindTag";
import { Plate } from "./Plate";
import { SectionHeader } from "./SectionHeader";

/** The front page's one big story: picture on the right, headline and
 *  standfirst on the left, set like a magazine cover line rather than a link. */
export function Lead({ entry, index, now }: { entry: Entry; index?: number; now: Date }) {
  return (
    <section data-band="lead" className="py-10">
      {/* The entry title is this band's heading, so the label is not one. */}
      <SectionHeader index={index} label="Latest" as="p" />
      <article className="group relative grid overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Kicker entry={entry} />
            <time className="font-ui text-xs text-muted-foreground" dateTime={entry.date}>
              {formatWhen(`${entry.date}T00:00:00Z`, now)}
            </time>
          </div>
          <h2 className="m-0 font-display text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-[1.1] tracking-tight">
            <Link href={entryPath(entry)} className="no-underline after:absolute after:inset-0 after:content-['']">
              {entry.title}
            </Link>
          </h2>
          <p className="m-0 font-display text-lg leading-relaxed text-muted-foreground">{entry.summary}</p>
          <p className="m-0 font-ui text-sm text-muted-foreground">
            By <span className="font-medium text-foreground">{entry.author ?? SITE.author}</span>
            {" · "}
            {readingMinutes(entry.body)} min read
          </p>
        </div>
        {/* First on a phone, so the picture leads; right-hand column on a desk. */}
        <div aria-hidden="true" className="order-first aspect-[16/10] overflow-hidden bg-muted lg:order-none lg:aspect-auto">
          {entry.cover ? (
            <img
              src={entry.cover}
              alt=""
              width={1600}
              height={1000}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <Plate entry={entry} />
          )}
        </div>
      </article>
    </section>
  );
}
