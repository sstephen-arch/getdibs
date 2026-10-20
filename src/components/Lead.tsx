import Link from "next/link";
import type { Entry } from "@/content/load";
import { entryPath } from "@/content/routes";
import { formatWhen, readingMinutes } from "@/lib/format";
import { KindTag } from "./KindTag";
import { Plate } from "./Plate";
import { SectionHeader } from "./SectionHeader";

export function Lead({ entry, index, now }: { entry: Entry; index?: number; now: Date }) {
  const href = entryPath(entry);
  return (
    <section data-band="lead" className="py-10">
      {/* The entry title is this band's heading, so the label is not one. */}
      <SectionHeader index={index} label="Latest" as="p" />
      <div className="group relative grid items-center gap-8 rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/50 sm:p-8 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <KindTag kind={entry.kind} />
            <time className="record text-[0.6875rem] text-muted-foreground" dateTime={entry.date}>
              {formatWhen(`${entry.date}T00:00:00Z`, now)}
            </time>
            <span className="record text-[0.6875rem] text-muted-foreground">
              · {readingMinutes(entry.body)} min read
            </span>
          </div>
          <h2 className="m-0 font-display text-[clamp(1.875rem,4vw,3rem)] font-semibold leading-[1.08] tracking-tight">
            <Link
              href={href}
              className="no-underline after:absolute after:inset-0 after:content-[''] group-hover:text-primary"
            >
              {entry.title}
            </Link>
          </h2>
          <p className="m-0 max-w-prose font-display text-lg leading-relaxed text-muted-foreground">{entry.summary}</p>
          <span aria-hidden className="font-ui text-sm font-medium text-primary">
            {entry.kind === "video" ? "Watch it" : `Read the ${entry.kind}`} →
          </span>
        </div>
        {entry.cover ? (
          <img
            src={entry.cover}
            alt=""
            width={1200}
            height={675}
            className="aspect-[16/9] w-full rounded-lg border border-border object-cover"
          />
        ) : (
          /* The plate restates fields shown beside it, so assistive tech skips it,
             and so does a phone, where it would only be more scrolling. */
          <div aria-hidden="true" className="hidden md:block">
            <Plate entry={entry} />
          </div>
        )}
      </div>
    </section>
  );
}
