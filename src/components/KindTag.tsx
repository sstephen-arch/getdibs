import type { Kind } from "@/content/schema";

export const KIND_LABELS: Record<Kind, string> = {
  essay: "Essay",
  note: "Note",
  link: "Link",
  video: "Video",
};

export function KindTag({ kind }: { kind: Kind }) {
  return (
    <span className="record inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[0.625rem] font-medium uppercase leading-4 tracking-[0.12em] text-muted-foreground">
      {KIND_LABELS[kind]}
    </span>
  );
}
