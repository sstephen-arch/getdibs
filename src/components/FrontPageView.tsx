import type { FrontPage } from "@/content/frontpage";
import { topicPath } from "@/content/routes";
import { SITE } from "@/lib/site";
import { Card } from "./Card";
import { Lead } from "./Lead";
import { Band } from "./Band";
import { ProjectCard } from "./ProjectCard";
import { SectionHeader } from "./SectionHeader";

export interface SiteCount {
  value: number;
  label: string;
}

/** Whose site this is and what it is for, said once, above everything else, on
 *  the one blue block the site allows itself. */
function Intro() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl items-end gap-8 px-5 pt-14 pb-12 sm:pt-20 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="m-0 font-mono text-xs font-medium uppercase tracking-[0.12em] text-primary-foreground/80">
            {SITE.author} · notes from the build
          </p>
          <h1 className="mt-4 mb-0 font-display text-[clamp(2.5rem,7vw,5.25rem)] font-bold leading-[0.95] tracking-[-0.045em]">
            Building with AI. Numbers left in.
          </h1>
        </div>
        <p className="m-0 max-w-md text-lg leading-relaxed text-primary-foreground/85">
          I run Claude Code most days and local models on my own Mac. This is where I
          write up what actually happened: the tokens, the test results, the failures,
          and the parts worth copying.
        </p>
      </div>
    </section>
  );
}

/** What is here, counted from the content itself so it can never go stale. */
function Counts({ counts }: { counts: SiteCount[] }) {
  return (
    <section aria-label="On this site" className="border-b-2 border-border">
      <dl className="mx-auto m-0 grid max-w-6xl grid-cols-2 sm:grid-cols-4">
        {counts.map((count) => (
          <div key={count.label} className="flex flex-col border-border px-5 py-5 odd:border-r-2 sm:border-r-2 sm:last:border-r-0">
            <dt className="order-2 font-ui text-sm text-muted-foreground">{count.label}</dt>
            <dd className="order-1 m-0 font-display text-4xl font-bold tracking-tight">{count.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function FrontPageView({ page, now, counts = [] }: { page: FrontPage; now: Date; counts?: SiteCount[] }) {
  if (page.state === "empty") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="m-0 font-display text-lg font-normal text-muted-foreground">Nothing published yet.</h1>
      </div>
    );
  }

  /* Sections are numbered in the order they render, so a band that is waiting
     for its minimum never leaves a gap in the count. */
  let section = 0;
  const next = () => ++section;

  return (
    <>
    <Intro />
    {counts.length > 0 && <Counts counts={counts} />}
    <div className="mx-auto max-w-6xl px-5">

      <Lead entry={page.lead} index={next()} now={now} />

      {page.bunks.length > 0 && (
        <section data-band="bunks" className="py-10">
          <SectionHeader index={next()} label="Also new" href="/archive/" linkLabel="Everything" />
          <div className={`grid gap-5 sm:grid-cols-2 ${page.bunks.length > 2 ? "lg:grid-cols-3" : ""}`}>
            {page.bunks.map((entry) => (
              <Card key={entry.slug} entry={entry} now={now} />
            ))}
          </div>
        </section>
      )}

      {/* No side rail of links: projects, watch and topics each get a band of
          their own below, so a rail would only repeat them as bare links. */}
      {page.feed.length > 0 && (
        <section data-band="feed" className="py-10">
          <SectionHeader index={next()} label="More writing" href="/archive/" linkLabel="Archive" />
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            {page.feed.map((entry) => (
              <Card key={entry.slug} entry={entry} size="row" now={now} />
            ))}
          </div>
        </section>
      )}

      {page.watch.length > 0 && (
        <Band id="watch" index={next()} title="Watch" href="/watch/">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page.watch.slice(0, 3).map((entry) => (
              <Card key={entry.slug} entry={entry} now={now} />
            ))}
          </div>
        </Band>
      )}

      {page.projects.length > 0 && (
        <Band id="projects" index={next()} title="Projects" href="/projects/">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page.projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </Band>
      )}

      {page.topics.length > 0 && (
        <Band id="topics" index={next()} title="Topics" href="/topics/">
          <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
            {page.topics.map((topic) => (
              <li key={topic.slug}>
                <a
                  href={topicPath(topic.slug)}
                  className="inline-flex items-center border-2 border-border bg-card px-4 py-2 font-ui text-sm font-bold no-underline transition-colors hover:bg-highlight"
                >
                  {topic.name}
                </a>
              </li>
            ))}
          </ul>
        </Band>
      )}
    </div>
    </>
  );
}
