const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Newsroom convention: relative for the first 48 hours, absolute after. An item
 *  from March says "12 March", never "4 months ago" — that is what stops a quiet
 *  fortnight reading as neglect. */
export function formatWhen(iso: string, now: Date): string {
  const then = new Date(iso);
  const diff = now.getTime() - then.getTime();

  if (diff < MINUTE) return "just now";
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (diff < 2 * DAY) return "yesterday";

  const sameYear = then.getUTCFullYear() === now.getUTCFullYear();
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "UTC",
  }).format(then);
}

/** Minutes to read a markdown body at 230 words a minute, never less than one.
 *  Table pipes and code fences are not words, so they are not counted. */
export function readingMinutes(body: string): number {
  const words = body.replace(/[|`#>*_]+|-{2,}/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
