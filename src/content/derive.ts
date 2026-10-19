import { ContentError } from "./validate";

const PREFIX = /^(\d{4}-\d{2}-\d{2})-(.+)$/;
const FULL_STOP = /[.!?](?=\s|$)/;

export function parseFilename(name: string): { date: string; slug: string } | null {
  const match = name.replace(/\.md$/, "").match(PREFIX);
  return match ? { date: match[1], slug: match[2] } : null;
}

export function entryDate(filename: string, declared?: string): string {
  const parsed = parseFilename(filename);
  if (declared) return declared;
  if (!parsed) throw new Error(`${filename}: needs a YYYY-MM-DD filename prefix`);
  return parsed.date;
}

/** A note's headline, when it has no title. First sentence, then a hard cap at a
 *  word boundary. This is what keeps posting a note to twenty seconds of work. */
export function noteHeadline(body: string, max = 160): string {
  const text = body.replace(/\s+/g, " ").trim();
  const stop = text.match(FULL_STOP);
  const sentence = stop ? text.slice(0, stop.index! + 1) : text;
  if (sentence.length <= max) return sentence;
  const clipped = sentence.slice(0, max);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

export function sortEntries<T extends { date: string; slug: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  );
}

export function publishedOnly<T extends { draft?: boolean }>(items: T[]): T[] {
  return items.filter((item) => !item.draft);
}

/** Slugs are the public URL, so two files may not claim the same one. Folding
 *  case makes the rule hold even on a case-insensitive filesystem, and naming
 *  the second file makes the mistake obvious. */
export function assertUniqueSlugs(
  items: { slug: string; file: string }[],
  label: "entry" | "project" = "project",
): void {
  const seen = new Set<string>();
  for (const { slug, file } of items) {
    const key = slug.toLowerCase();
    if (seen.has(key)) {
      throw new ContentError(`${file}: duplicate ${label} slug "${key}"`);
    }
    seen.add(key);
  }
}
