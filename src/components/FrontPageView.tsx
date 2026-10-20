import type { FrontPage } from "@/content/frontpage";
import { topicPath } from "@/content/routes";
import { SITE } from "@/lib/site";
import { Card } from "./Card";
import { Lead } from "./Lead";
import { Rail } from "./Rail";
import { Band } from "./Band";
import { ProjectCard } from "./ProjectCard";
import { SectionHeader } from "./SectionHeader";

/** Whose site this is and what it is for, said once, above everything else. */
function Intro() {
  return (
    <section className="border-b border-border pt-12 pb-10 sm:pt-16">
      <p className="eyebrow m-0">{SITE.author} · notes from the build</p>
      <h1 className="mt-4 mb-0 max-w-3xl font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.06] tracking-tight">
        What I&rsquo;m building with AI, with the numbers left in.
      </h1>
      <p className="mt-5 mb-0 max-w-2xl font-display text-lg leading-relaxed text-muted-foreground">
        I run Claude Code most days and local models on my own Mac. This is where I
        write up what actually happened: the tokens, the test results, the failures,
        and the parts worth copying.
      </p>
    </section>
  );
}

export function FrontPageView({ page, now }: { page: FrontPage; now: Date }) {
  if (page.state === "empty") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="m-0 font-display text-lg font-normal text-muted-foreground">Nothing published yet.</h1>
      </div>
    );
  }

  const hasRail = page.watch.length > 0 || page.projects.length > 0 || page.topics.length > 0;

  /* Sections are numbered in the order they render, so a band that is waiting
     for its minimum never leaves a gap in the count. */
  let section = 0;
  const next = () => ++section;

  return (
    <div className="mx-auto max-w-6xl px-5">
      <Intro />

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

      {page.feed.length > 0 && (
        <section
          data-band="feed"
          className={`grid gap-x-8 gap-y-5 py-10 ${hasRail ? "lg:grid-cols-[1fr_18rem]" : ""}`}
        >
          <div className="col-span-full -mb-5">
            <SectionHeader index={next()} label="The log" href="/archive/" linkLabel="Archive" />
          </div>
          <div className="flex flex-col divide-y divide-border self-start overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            {page.feed.map((entry) => (
              <Card key={entry.slug} entry={entry} size="row" now={now} />
            ))}
          </div>
          {hasRail && <Rail page={page} />}
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
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-ui text-sm font-medium no-underline shadow-sm hover:border-primary/50 hover:text-primary"
                >
                  <span className="record text-muted-foreground">#</span>
                  {topic.name}
                </a>
              </li>
            ))}
          </ul>
        </Band>
      )}
    </div>
  );
}
