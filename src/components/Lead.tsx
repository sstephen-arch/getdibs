import Link from "next/link";
import type { Entry } from "@/content/load";
import { entryPath } from "@/content/routes";
import { formatWhen } from "@/lib/format";
import { KindTag } from "./KindTag";
import { Plate } from "./Plate";

export function Lead({ entry, now }: { entry: Entry; now: Date }) {
  const href = entryPath(entry);
  return (
    <section data-band="lead" className="border-b border-border py-8">
      <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-3">
            <KindTag kind={entry.kind} />
            <time className="record text-[0.6875rem] text-muted-foreground" dateTime={entry.date}>
              {formatWhen(`${entry.date}T00:00:00Z`, now)}
            </time>
          </div>
          <h2 className="m-0 font-display text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight">
            <Link href={href} className="no-underline hover:underline hover:underline-offset-4">
              {entry.title}
            </Link>
          </h2>
          <p className="m-0 max-w-prose font-display text-lg text-muted-foreground">{entry.summary}</p>
        </div>
        {entry.cover ? (
          <img
            src={entry.cover}
            alt=""
            width={1200}
            height={675}
            className="aspect-[16/9] w-full border border-border object-cover"
          />
        ) : (
          /* The title is already the lead's heading; the plate is a visual
             treatment, so assistive tech should not read it twice. */
          <div aria-hidden="true">
            <Plate entry={entry} size="lead" />
          </div>
        )}
      </div>
    </section>
  );
}
