import Link from "next/link";
import type { Entry } from "@/content/load";
import { headingsOf } from "@/content/render";
import { SECTION_OF_KIND, topicPath } from "@/content/routes";
import { TOPICS } from "@/content/schema";
import { formatWhen, readingMinutes } from "@/lib/format";
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

/** A table of contents earns its column only when there is something to jump
 *  between. */
const MIN_HEADINGS = 3;

export function Article({ entry, html, now }: { entry: Entry; html: string; now: Date }) {
  const videoId = entry.kind === "video" ? videoIdOf(entry) : null;
  const linkHost = entry.kind === "link" && entry.url ? hostnameOf(entry.url) : null;
  const section = SECTION_OF_KIND[entry.kind];
  const headings = headingsOf(html);
  const hasToc = headings.length >= MIN_HEADINGS;
  const topics = TOPICS.filter((topic) => entry.topics?.includes(topic.slug));

  return (
    <div
      className={`mx-auto grid max-w-6xl gap-12 px-5 py-10 ${hasToc ? "lg:grid-cols-[minmax(0,1fr)_15rem]" : ""}`}
    >
      <article className={`min-w-0 ${hasToc ? "" : "mx-auto w-full max-w-3xl"}`}>
        <nav aria-label="Breadcrumb" className="record mb-6 text-[0.75rem] text-muted-foreground">
          <Link href="/" className="no-underline hover:text-primary">~</Link>
          {" / "}
          <Link href={`/${section}/`} className="no-underline hover:text-primary">{section}</Link>
          {" / "}
          <span className="text-foreground">{entry.slug}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <KindTag kind={entry.kind} />
          <time className="record text-[0.6875rem] text-muted-foreground" dateTime={entry.date}>
            {formatWhen(`${entry.date}T12:00:00Z`, now)}
          </time>
          <span className="record text-[0.6875rem] text-muted-foreground">· {readingMinutes(entry.body)} min read</span>
          {entry.updated && (
            <span className="record text-[0.6875rem] text-muted-foreground">
              · Updated {formatWhen(`${entry.updated}T12:00:00Z`, now)}
            </span>
          )}
        </div>

        <h1 className="mt-4 mb-3 max-w-3xl font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.08] tracking-tight">
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
          <p className="measure m-0 mb-8 font-display text-xl leading-relaxed text-muted-foreground">
            {entry.summary}
          </p>
        )}

        {/* For a link, the point of the page is the piece it points at, so the way
            out is a labelled control rather than a bare underlined hostname. The
            hostname stays visible next to it: the name says which publication, the
            hostname says which site, and they are not always the same thing. */}
        {entry.kind === "link" && entry.url && (
          <p className="m-0 mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-ui text-sm">
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2 font-medium text-primary-foreground no-underline hover:bg-primary/90"
            >
              Read the original{entry.source ? ` at ${entry.source}` : ""}
              <span aria-hidden>↗</span>
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

        <div className="measure border-t border-border pt-8">
          <Prose html={html} />
        </div>

        <footer className="measure mt-14 flex flex-col gap-4 border-t border-border pt-6 font-ui text-sm">
          {topics.length > 0 && (
            <p className="m-0 flex flex-wrap items-center gap-2">
              <span className="eyebrow mr-1">Filed under</span>
              {topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={topicPath(topic.slug)}
                  className="rounded-full border border-border bg-card px-3 py-1 no-underline hover:border-primary/50 hover:text-primary"
                >
                  {topic.name}
                </Link>
              ))}
            </p>
          )}
          <p className="m-0 flex flex-wrap justify-between gap-3 text-muted-foreground">
            <Link href={`/${section}/`} className="no-underline hover:text-primary">
              ← All {section}
            </Link>
            <a
              href={`${SITE.repo}/blob/main/${entry.file}`}
              className="record text-[0.75rem] no-underline hover:text-primary"
            >
              view source: {entry.file} ↗
            </a>
          </p>
        </footer>
      </article>

      {hasToc && (
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-24 rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="eyebrow m-0 mb-3">On this page</p>
            <ol className="m-0 flex list-none flex-col gap-2 p-0 font-ui text-sm">
              {headings.map((heading, i) => (
                <li key={heading.id} className="flex gap-2">
                  <span className="record shrink-0 text-[0.6875rem] leading-5 text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a href={`#${heading.id}`} className="leading-5 text-muted-foreground no-underline hover:text-primary">
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      )}
    </div>
  );
}
