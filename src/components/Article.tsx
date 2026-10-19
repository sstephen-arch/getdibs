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

export function Article({ entry, html, now }: { entry: Entry; html: string; now: Date }) {
  const videoId = entry.kind === "video" ? videoIdOf(entry) : null;

  return (
    <article className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-baseline gap-3">
        <KindTag kind={entry.kind} />
        <time className="record text-[0.6875rem] text-muted-foreground" dateTime={entry.date}>
          {formatWhen(`${entry.date}T12:00:00Z`, now)}
        </time>
        {entry.updated && (
          <span className="record text-[0.6875rem] text-muted-foreground">
            · Updated {formatWhen(`${entry.updated}T12:00:00Z`, now)}
          </span>
        )}
        {/* Byline from frontmatter, with the site author as the default, so an
            essay never prints without a name against it. */}
        <span className="record text-[0.6875rem] text-muted-foreground">
          · {entry.author ?? SITE.author}
        </span>
      </div>

      <h1 className="mt-4 mb-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.08] tracking-tight">
        {entry.title}
      </h1>

      {entry.summary && (
        <p className="measure m-0 mb-6 font-display text-xl leading-relaxed text-muted-foreground">
          {entry.summary}
        </p>
      )}

      {entry.kind === "link" && entry.url && (
        <p className="record mb-6 text-sm text-muted-foreground">
          <a href={entry.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            {entry.source ?? new URL(entry.url).hostname}
          </a>
          {entry.source && <span> · {new URL(entry.url).hostname}</span>}
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
