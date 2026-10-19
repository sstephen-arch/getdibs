import Link from "next/link";
import type { Entry } from "@/content/load";
import { entryPath } from "@/content/routes";
import { formatWhen } from "@/lib/format";
import { KindTag } from "./KindTag";
import { Plate } from "./Plate";

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

  return (
    <article className="group relative flex flex-col gap-3">
      {/* The heading below is the item's accessible name. The plate repeats the
          title as a visual treatment, so the media is hidden rather than read
          to a screen reader twice. */}
      <div aria-hidden="true">
        {entry.cover ? (
          <img
            src={entry.cover}
            alt=""
            width={1200}
            height={750}
            className="aspect-[16/10] w-full border border-border object-cover"
            loading="lazy"
          />
        ) : (
          <Plate entry={entry} size={size} />
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <KindTag kind={entry.kind} />
        <time className="record text-[0.6875rem] text-muted-foreground" dateTime={entry.date}>
          {formatWhen(`${entry.date}T00:00:00Z`, now)}
        </time>
      </div>
      <h3 className="m-0 font-display text-xl font-semibold leading-snug">
        <Link
          href={href}
          className="no-underline after:absolute after:inset-0 after:content-[''] hover:underline hover:underline-offset-4"
        >
          {entry.title}
        </Link>
      </h3>
      {size === "row" && <p className="m-0 text-sm text-muted-foreground">{entry.summary}</p>}
    </article>
  );
}
