import Link from "next/link";
import type { Entry } from "@/content/load";
import { entryPath } from "@/content/routes";
import { formatWhen } from "@/lib/format";
import { Kicker } from "./KindTag";
import { Plate } from "./Plate";

/** The image slot. The headline is the item's accessible name, so the cover is
 *  decoration here; the article page is where it gets alt text. */
function Cover({ entry, className }: { entry: Entry; className: string }) {
  return (
    <div aria-hidden="true" className={`overflow-hidden bg-muted ${className}`}>
      {entry.cover ? (
        <img
          src={entry.cover}
          alt=""
          width={1600}
          height={1000}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      ) : (
        <Plate entry={entry} />
      )}
    </div>
  );
}

function Meta({ entry, now }: { entry: Entry; now: Date }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <Kicker entry={entry} />
      <time className="font-ui text-xs text-muted-foreground" dateTime={entry.date}>
        {formatWhen(`${entry.date}T00:00:00Z`, now)}
      </time>
    </div>
  );
}

/** One item in a list, set like a magazine card: picture, kicker, headline,
 *  standfirst. Nothing in it is styled as a hyperlink. The headline's anchor
 *  stretches over the whole card through its pseudo-element, so the card is
 *  one target named by its headline, and the hover is a lift, not a colour. */
export function Card({
  entry,
  size = "card",
  now,
}: {
  entry: Entry;
  size?: "card" | "row";
  now: Date;
}) {
  const title = (
    <Link href={entryPath(entry)} className="no-underline after:absolute after:inset-0 after:content-['']">
      {entry.title}
    </Link>
  );

  if (size === "row") {
    return (
      <article className="group relative grid gap-5 p-5 transition-colors hover:bg-muted/40 sm:grid-cols-[13rem_1fr] sm:items-center">
        <Cover entry={entry} className="aspect-[16/10] rounded-md border border-border" />
        <div className="flex flex-col gap-2">
          <Meta entry={entry} now={now} />
          <h3 className="m-0 font-display text-xl font-bold leading-tight tracking-tight">{title}</h3>
          <p className="m-0 text-sm leading-relaxed text-muted-foreground">{entry.summary}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
      <Cover entry={entry} className="aspect-[16/10] border-b border-border" />
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <Meta entry={entry} now={now} />
        <h3 className="m-0 font-display text-xl font-bold leading-tight tracking-tight">{title}</h3>
        <p className="m-0 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{entry.summary}</p>
      </div>
    </article>
  );
}
