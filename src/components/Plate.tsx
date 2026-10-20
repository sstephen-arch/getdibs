import { Fragment } from "react";
import type { Entry } from "@/content/load";
import { readingMinutes } from "@/lib/format";

const TOPIC_COLOUR: Record<string, string> = {
  "local-ai": "hsl(var(--highlight))",
  "claude-code": "hsl(var(--live))",
};

export function topicColour(slug?: string): string {
  return (slug && TOPIC_COLOUR[slug]) || "hsl(var(--primary))";
}

/** The cover when there is one; this when there is not. The plate is the item's
 *  own source file, opened at its frontmatter: the real path, the real fields,
 *  and the reading time as a comment because it is derived rather than written.
 *  It used to repeat the title on a dark slab; this says something the headline
 *  next to it does not. */
export function Plate({ entry }: { entry: Entry }) {
  const topic = entry.topics?.[0];
  const fields: [string, string][] = [
    ["kind", entry.kind],
    ["date", entry.date],
    ...(entry.topics?.length ? [["topics", `[${entry.topics.join(", ")}]`] as [string, string]] : []),
    ...(entry.source ? [["source", entry.source] as [string, string]] : []),
    ...(entry.project ? [["project", entry.project] as [string, string]] : []),
  ];

  return (
    <div data-plate className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
        <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: topicColour(topic) }} />
        <span className="record truncate text-[0.6875rem] text-muted-foreground">{entry.file}</span>
      </div>
      <pre className="record m-0 overflow-x-auto px-5 py-4 text-[0.8125rem] leading-7 text-foreground">
        <span className="text-muted-foreground">---</span>
        {"\n"}
        {fields.map(([key, value]) => (
          <Fragment key={key}>
            <span className="text-primary">{key}</span>: {value}
            {"\n"}
          </Fragment>
        ))}
        <span className="text-muted-foreground">---</span>
        {"\n"}
        <span className="text-muted-foreground"># {readingMinutes(entry.body)} min read</span>
      </pre>
    </div>
  );
}
