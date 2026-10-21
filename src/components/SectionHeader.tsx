import Link from "next/link";

/** The rule every section opens with: a numbered mono label, a hairline to the
 *  right edge, and an optional way into the full list. Numbering is assigned by
 *  the page from the sections that actually render, so a band that waits for
 *  its minimum never leaves a gap in the count. */
export function SectionHeader({
  index,
  label,
  href,
  linkLabel,
  as: Heading = "h2",
}: {
  index?: number;
  label: string;
  href?: string;
  linkLabel?: string;
  as?: "h2" | "p";
}) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <Heading className="m-0 shrink-0 font-display text-2xl font-bold tracking-tight">
        {index !== undefined && <span className="mr-2 text-primary">{String(index).padStart(2, "0")}</span>}
        {label}
      </Heading>
      <span aria-hidden className="h-0.5 flex-1 bg-foreground" />
      {href && (
        <Link href={href} className="shrink-0 font-ui text-sm font-bold text-foreground no-underline hover:text-primary">
          {linkLabel ?? `All ${label.toLowerCase()}`} →
        </Link>
      )}
    </div>
  );
}
