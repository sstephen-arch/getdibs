import type { Entry } from "@/content/load";
import { Card } from "./Card";

/** The page head every index shares: a path-style label, the title, the intro,
 *  and the count, ruled off from the list below it. */
export function IndexHeader({
  path,
  title,
  intro,
  count,
}: {
  path?: string;
  title: string;
  intro?: string;
  count?: string;
}) {
  return (
    <header className="border-b-2 border-border pb-8">
      {path && <p className="eyebrow m-0 mb-3">{path}</p>}
      <h1 className="m-0 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-bold tracking-[-0.04em]">{title}</h1>
      {intro && <p className="measure mt-3 mb-0 font-display text-lg leading-relaxed text-muted-foreground">{intro}</p>}
      {count && <p className="record mt-4 mb-0 text-[0.6875rem] text-muted-foreground">{count}</p>}
    </header>
  );
}

/** The sparse rule lives here once: below three items a grid would be half empty,
 *  so the index prints log rows in one panel. At three or more, it is a grid. */
export function IndexList({
  title,
  path,
  intro,
  items,
  emptyLabel,
  now,
}: {
  title: string;
  path?: string;
  intro?: string;
  items: Entry[];
  emptyLabel: string;
  now: Date;
}) {
  const dense = items.length >= 3;

  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <IndexHeader
        path={path}
        title={title}
        intro={intro}
        count={items.length > 0 ? `${items.length} ${items.length === 1 ? "item" : "items"}, newest first` : undefined}
      />

      {items.length === 0 ? (
        <p className="mt-8 font-display text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div
          data-layout={dense ? "grid" : "rows"}
          className={
            dense
              ? "mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              : "mt-8 flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-sm"
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
