import type { Kind } from "@/content/schema";

export const KIND_LABELS: Record<Kind, string> = {
  essay: "Essay",
  note: "Note",
  link: "Link",
  video: "Video",
};

export function KindTag({ kind }: { kind: Kind }) {
  return (
    <span className="record text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">
      {KIND_LABELS[kind]}
    </span>
  );
}
