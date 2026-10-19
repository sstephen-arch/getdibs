import type { Entry } from "@/content/load";
import { KIND_LABELS } from "./KindTag";

const TOPIC_COLOUR: Record<string, string> = {
  "local-ai": "hsl(var(--highlight))",
};

export function topicColour(slug?: string): string {
  return (slug && TOPIC_COLOUR[slug]) || "hsl(var(--primary))";
}

const ASPECT = {
  lead: "aspect-[16/9] md:aspect-[21/9]",
  card: "aspect-[16/10]",
  row: "aspect-[4/3]",
} as const;

/** The cover when there is one; this when there is not. A typographic plate is
 *  never a placeholder — it is a finished treatment, which is why an image-less
 *  news page does not look like a wireframe. */
export function Plate({ entry, size = "card" }: { entry: Entry; size?: keyof typeof ASPECT }) {
  const topic = entry.topics?.[0];
  return (
    <div
      data-plate
      className={`relative flex ${ASPECT[size]} w-full flex-col justify-between overflow-hidden border border-border bg-card p-5`}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: topicColour(topic) }}
      />
      <span className="record text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">
        {KIND_LABELS[entry.kind]}
        {topic ? ` · ${topic}` : ""}
      </span>
      <span className="font-display text-2xl font-semibold leading-tight text-foreground">
        {entry.title}
      </span>
    </div>
  );
}
