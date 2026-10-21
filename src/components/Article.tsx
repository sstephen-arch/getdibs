import Link from "next/link";
import { videoIdOf } from "@/content/derive";
import type { Entry } from "@/content/load";
import { headingsOf } from "@/content/render";
import { SECTION_OF_KIND, topicPath } from "@/content/routes";
import { TOPICS } from "@/content/schema";
import { formatWhen, readingMinutes } from "@/lib/format";
import { SITE } from "@/lib/site";
import { Kicker } from "./KindTag";
import { Prose } from "./Prose";
import { VideoEmbed } from "./VideoEmbed";

/** Hostname for a link-out. Frontmatter is validated at load time, so a bad URL
 *  never reaches here; the try keeps a render from throwing if one ever does. */
function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const STAT_COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

/** The figures a reader should know before trusting the piece, printed large
 *  under the standfirst. A description list, so each number keeps its label
 *  for assistive tech; CSS order puts the number on top. */
function Stats({ stats }: { stats: NonNullable<Entry["stats"]> }) {
  return (
    <section aria-label="By the numbers" className="mb-10">
      <dl
        /* The 1px gap over a border-coloured ground draws the hairlines, so the
           dividers stay right however the grid wraps. */
        className={`m-0 grid gap-px overflow-hidden rounded-lg border border-border bg-border shadow-sm ${STAT_COLUMNS[stats.length]}`}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 bg-card px-3 py-4 sm:px-5">
            <dt className="order-2 font-ui text-xs font-medium text-foreground sm:text-sm">{stat.label}</dt>
            <dd className="order-1 m-0 font-display text-[1.5rem] font-semibold leading-none tracking-tight sm:text-[2rem]">
              {stat.value}
            </dd>
            {stat.detail && <dd className="order-3 m-0 font-ui text-xs leading-snug text-muted-foreground">{stat.detail}</dd>}
          </div>
        ))}
      </dl>
    </section>
  );
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
        <nav aria-label="Breadcrumb" className="mb-6 font-ui text-sm text-muted-foreground">
          <Link href="/" className="no-underline hover:text-foreground">Home</Link>
          <span aria-hidden className="mx-2">/</span>
          <Link href={`/${section}/`} className="capitalize no-underline hover:text-foreground">{section}</Link>
        </nav>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Kicker entry={entry} />
          <time className="font-ui text-xs text-muted-foreground" dateTime={entry.date}>
            {formatWhen(`${entry.date}T12:00:00Z`, now)}
          </time>
          <span className="font-ui text-xs text-muted-foreground">· {readingMinutes(entry.body)} min read</span>
          {entry.updated && (
            <span className="font-ui text-xs text-muted-foreground">
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

        {entry.stats && <Stats stats={entry.stats} />}

        {/* A link item names its source up front as plain text; the way out is a
            citation box at the end, so the page reads as commentary rather than
            a button pushing the reader somewhere else. */}
        {entry.kind === "link" && entry.source && (
          <p className="m-0 mb-8 font-ui text-sm text-muted-foreground">
            On a piece from <span className="font-medium text-foreground">{entry.source}</span>
          </p>
        )}

        {entry.cover && !videoId && (
          <figure className="m-0 mb-10">
            <img
              src={entry.cover}
              alt={entry.cover_alt ?? ""}
              width={1600}
              height={1000}
              className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
            />
            {entry.cover_credit && (
              <figcaption className="mt-2 font-ui text-xs text-muted-foreground">{entry.cover_credit}</figcaption>
            )}
          </figure>
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

        {entry.kind === "link" && entry.url && (
          <aside className="measure mt-12 rounded-lg border border-border bg-card p-5 font-ui text-sm shadow-sm">
            <p className="eyebrow m-0 mb-2">Source</p>
            <p className="m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
              >
                Read the original{entry.source ? ` at ${entry.source}` : ""}
                <span aria-hidden> ↗</span>
              </a>
              {linkHost && <span className="text-muted-foreground">{linkHost}</span>}
            </p>
          </aside>
        )}

        <footer className="measure mt-14 flex flex-col gap-4 border-t border-border pt-6 font-ui text-sm">
          {topics.length > 0 && (
            <p className="m-0 flex flex-wrap items-center gap-2">
              <span className="eyebrow mr-1">Filed under</span>
              {topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={topicPath(topic.slug)}
                  className="rounded-full border border-border bg-card px-3 py-1 no-underline hover:border-foreground/30"
                >
                  {topic.name}
                </Link>
              ))}
            </p>
          )}
          <p className="m-0 flex flex-wrap justify-between gap-3 text-muted-foreground">
            <Link href={`/${section}/`} className="no-underline hover:text-foreground">
              ← All {section}
            </Link>
            <a href={`${SITE.repo}/blob/main/${entry.file}`} className="no-underline hover:text-foreground">
              View source on GitHub
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
                  <a href={`#${heading.id}`} className="leading-5 text-muted-foreground no-underline hover:text-foreground">
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
