import type { Entry } from "@/content/load";

const TOPIC_COLOUR: Record<string, string> = {
  "local-ai": "hsl(var(--highlight))",
  "claude-code": "hsl(var(--live))",
};

export function topicColour(slug?: string): string {
  return (slug && TOPIC_COLOUR[slug]) || "hsl(var(--primary))";
}

/** What fills the image slot when an item has no cover yet: a field of its
 *  topic colour with a quiet dot grid. It carries no text, so it never competes
 *  with the headline beside it and never reads as a placeholder box. */
export function Plate({ entry }: { entry: Entry }) {
  const colour = topicColour(entry.topics?.[0]);
  return (
    <div
      data-plate
      className="h-full w-full"
      style={{
        backgroundColor: colour,
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.28) 1.5px, transparent 1.5px), linear-gradient(135deg, rgba(255,255,255,0.18), rgba(0,0,0,0.18))",
        backgroundSize: "22px 22px, 100% 100%",
      }}
    />
  );
}
