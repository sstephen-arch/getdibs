import type { Entry } from "@/content/load";
import { Card } from "./Card";

/** The sparse rule lives here once: below three items a grid would be half empty,
 *  so the index prints rows. At three or more, it is a grid. */
export function IndexList({
  title,
  intro,
  items,
  emptyLabel,
  now,
}: {
  title: string;
  intro?: string;
  items: Entry[];
  emptyLabel: string;
  now: Date;
}) {
  const dense = items.length >= 3;

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="m-0 font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight">{title}</h1>
      {intro && <p className="measure mt-3 font-display text-lg text-muted-foreground">{intro}</p>}

      {items.length === 0 ? (
        <p className="mt-8 font-display text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div
          data-layout={dense ? "grid" : "rows"}
          className={
            dense
              ? "mt-8 grid gap-10 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-3"
              : "mt-8 flex flex-col gap-10 border-t border-border pt-8"
          }
        >
          {items.map((entry) => (
            <Card key={entry.slug} entry={entry} size={dense ? "card" : "row"} now={now} />
          ))}
        </div>
      )}
    </section>
  );
}
