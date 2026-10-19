import type { FrontPage } from "@/content/frontpage";
import { projectPath, topicPath } from "@/content/routes";
import { SITE } from "@/lib/site";
import { Card } from "./Card";
import { Lead } from "./Lead";
import { Rail } from "./Rail";
import { Band } from "./Band";

export function FrontPageView({ page, now }: { page: FrontPage; now: Date }) {
  if (page.state === "empty") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="m-0 font-display text-lg font-normal text-muted-foreground">Nothing published yet.</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* The masthead carries the wordmark; this names the page for assistive
          tech without repeating it visually. */}
      <h1 className="sr-only">Latest from {SITE.name}</h1>

      <Lead entry={page.lead} now={now} />

      {page.bunks.length > 0 && (
        <section data-band="bunks" className="grid gap-8 border-b border-border py-8 sm:grid-cols-3">
          {page.bunks.map((entry) => (
            <Card key={entry.slug} entry={entry} now={now} />
          ))}
        </section>
      )}

      {page.feed.length > 0 && (
        <section data-band="feed" className="grid gap-10 border-b border-border py-8 lg:grid-cols-[1fr_18rem]">
          <div className="flex flex-col gap-10">
            {page.feed.map((entry) => (
              <Card key={entry.slug} entry={entry} size="row" now={now} />
            ))}
          </div>
          <Rail page={page} />
        </section>
      )}

      {page.watch.length > 0 && (
        <Band id="watch" title="Watch" href="/watch/">
          <div className="grid gap-8 sm:grid-cols-3">
            {page.watch.slice(0, 3).map((entry) => (
              <Card key={entry.slug} entry={entry} now={now} />
            ))}
          </div>
        </Band>
      )}

      {page.projects.length > 0 && (
        <Band id="projects" title="Projects" href="/projects/">
          <div className="grid gap-8 sm:grid-cols-3">
            {page.projects.map((project) => (
              <article key={project.slug} className="flex flex-col gap-2">
                <p className="record m-0 text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">
                  {project.status} · {project.year}
                </p>
                <h3 className="m-0 font-display text-xl font-semibold">
                  <a href={projectPath(project)} className="no-underline hover:underline">{project.title}</a>
                </h3>
                <p className="m-0 text-sm text-muted-foreground">{project.summary}</p>
              </article>
            ))}
          </div>
        </Band>
      )}

      {page.topics.length > 0 && (
        <Band id="topics" title="Topics" href="/topics/">
          <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
            {page.topics.map((topic) => (
              <li key={topic.slug}>
                <a
                  href={topicPath(topic.slug)}
                  className="inline-block rounded-control border border-border px-3 py-1.5 font-ui text-sm no-underline hover:border-highlight"
                >
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
