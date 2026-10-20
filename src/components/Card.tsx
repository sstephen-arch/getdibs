import Link from "next/link";
import type { Entry } from "@/content/load";
import { entryPath } from "@/content/routes";
import { formatWhen } from "@/lib/format";
import { KindTag } from "./KindTag";

function Topics({ topics }: { topics?: string[] }) {
  if (!topics?.length) return null;
  return (
    <p className="record m-0 flex flex-wrap gap-x-3 text-[0.6875rem] text-muted-foreground">
      {topics.map((topic) => (
        <span key={topic}>#{topic}</span>
      ))}
    </p>
  );
}

/** One item in a list. `card` is a white panel for grids; `row` is a log line
 *  for a stacked list, date in the gutter. Either way the title is the only link
 *  and its pseudo-element stretches over the whole item, so the item is one
 *  target named by its headline. */
export function Card({
  entry,
  size = "card",
  now,
}: {
  entry: Entry;
  size?: "card" | "row";
  now: Date;
}) {
  const href = entryPath(entry);
  const when = (
    <time className="record text-[0.6875rem] text-muted-foreground" dateTime={entry.date}>
      {formatWhen(`${entry.date}T00:00:00Z`, now)}
    </time>
  );
  const title = (
    <Link
      href={href}
      className="no-underline after:absolute after:inset-0 after:content-[''] group-hover:text-primary"
    >
      {entry.title}
    </Link>
  );

  if (size === "row") {
    return (
      <article className="group relative grid gap-x-6 gap-y-2 px-5 py-5 transition-colors hover:bg-muted/40 sm:grid-cols-[8.5rem_1fr]">
        <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
          <KindTag kind={entry.kind} />
          {when}
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="m-0 font-display text-xl font-semibold leading-snug">{title}</h3>
          <p className="m-0 text-sm leading-relaxed text-muted-foreground">{entry.summary}</p>
          <Topics topics={entry.topics} />
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/50">
      {entry.cover && (
        /* The heading below is the item's accessible name; the cover is decoration. */
        <div aria-hidden="true" className="-mx-5 -mt-5 mb-1 border-b border-border">
          <img
            src={entry.cover}
            alt=""
            width={1200}
            height={750}
            className="aspect-[16/10] w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex items-center gap-3">
        <KindTag kind={entry.kind} />
        {when}
      </div>
      <h3 className="m-0 font-display text-xl font-semibold leading-snug">{title}</h3>
      <p className="m-0 text-sm leading-relaxed text-muted-foreground">{entry.summary}</p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-2">
        <Topics topics={entry.topics} />
        <span aria-hidden className="ml-auto font-ui text-sm font-medium text-primary">
          Read →
        </span>
      </div>
    </article>
  );
}
