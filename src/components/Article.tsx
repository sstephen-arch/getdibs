import type { Entry } from "@/content/load";
import { formatWhen } from "@/lib/format";
import { SITE } from "@/lib/site";
import { KindTag } from "./KindTag";
import { Prose } from "./Prose";
import { VideoEmbed } from "./VideoEmbed";

export function videoIdOf(entry: Entry): string | null {
  if (entry.video_id) return entry.video_id;
  if (!entry.video_url) return null;
  const match = entry.video_url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return match ? match[1] : null;
}

/** Hostname for a link-out. Frontmatter is validated at load time, so a bad URL
 *  never reaches here; the try keeps a render from throwing if one ever does. */
function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function Article({ entry, html, now }: { entry: Entry; html: string; now: Date }) {
  const videoId = entry.kind === "video" ? videoIdOf(entry) : null;
  const linkHost = entry.kind === "link" && entry.url ? hostnameOf(entry.url) : null;

  return (
    <article className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <KindTag kind={entry.kind} />
        <time className="record text-[0.6875rem] text-muted-foreground" dateTime={entry.date}>
          {formatWhen(`${entry.date}T12:00:00Z`, now)}
        </time>
        {entry.updated && (
          <span className="record text-[0.6875rem] text-muted-foreground">
            · Updated {formatWhen(`${entry.updated}T12:00:00Z`, now)}
          </span>
        )}
      </div>

      <h1 className="mt-4 mb-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.08] tracking-tight">
        {entry.title}
      </h1>

      {/* Who wrote this, on its own line above the standfirst. It used to sit in
          the record row with the date, at 11px, which is not an answer to "who
          wrote this" — it is a place to hide one. */}
      <p className="m-0 mb-5 font-ui text-sm text-muted-foreground">
        {"By "}
        <span className="font-medium text-foreground">{entry.author ?? SITE.author}</span>
      </p>

      {entry.summary && (
        <p className="measure m-0 mb-6 font-display text-xl leading-relaxed text-muted-foreground">
          {entry.summary}
        </p>
      )}

      {/* For a link, the point of the page is the piece it points at, so the way
          out is a labelled control rather than a bare underlined hostname. The
          hostname stays visible next to it: the name says which publication, the
          hostname says which site, and they are not always the same thing. */}
      {entry.kind === "link" && entry.url && (
        <p className="m-0 mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-2 font-ui text-sm">
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-baseline gap-2 rounded-control border border-border px-3 py-1.5 text-foreground no-underline hover:border-highlight"
          >
            Read the original{entry.source ? ` at ${entry.source}` : ""}
            <span aria-hidden className="text-muted-foreground">↗</span>
          </a>
          {linkHost && <span className="record text-muted-foreground">{linkHost}</span>}
        </p>
      )}

      {videoId && (
        <VideoEmbed
          id={videoId}
          title={entry.title}
          channel={entry.channel ?? ""}
          url={entry.url ?? entry.video_url ?? `https://www.youtube.com/watch?v=${videoId}`}
        />
      )}

      <div className="measure">
        <Prose html={html} />
      </div>
    </article>
  );
}
