import type { Entry } from "@/content/load";
import { TOPICS, type Kind } from "@/content/schema";
import { topicColour } from "./Plate";

export const KIND_LABELS: Record<Kind, string> = {
  essay: "Essay",
  note: "Note",
  link: "Worth reading",
  video: "Video",
};

const KICKER = "font-ui text-xs font-semibold uppercase tracking-[0.08em]";

export function KindTag({ kind }: { kind: Kind }) {
  return <span className={`${KICKER} text-muted-foreground`}>{KIND_LABELS[kind]}</span>;
}

/** The line above a headline, as a newspaper prints it: the desk the piece is
 *  filed under, marked with its colour. A pointer to someone else's work says
 *  so instead, because that is the more useful thing to know. The colour is a
 *  dot, never the text, so small type keeps its contrast. */
export function Kicker({ entry }: { entry: Entry }) {
  const topic = TOPICS.find((item) => item.slug === entry.topics?.[0]);
  const label = entry.kind === "link" || !topic ? KIND_LABELS[entry.kind] : topic.name;
  return (
    <span className={`${KICKER} inline-flex items-center gap-2 text-foreground`}>
      <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: topicColour(topic?.slug) }} />
      {label}
    </span>
  );
}
