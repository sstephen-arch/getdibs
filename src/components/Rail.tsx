import Link from "next/link";
import type { FrontPage } from "@/content/frontpage";
import { entryPath, projectPath, topicPath } from "@/content/routes";

/** Built from whatever exists. A section with nothing in it contributes no block
 *  and no apology line; with nothing at all, the rail renders nothing. */
export function Rail({ page }: { page: Extract<FrontPage, { state: "assembled" }> }) {
  if (page.watch.length === 0 && page.projects.length === 0 && page.topics.length === 0) {
    return null;
  }

  return (
    <aside data-band="rail" className="flex flex-col gap-8 font-ui text-sm lg:border-l lg:border-border lg:pl-6">
      {page.watch.length > 0 && (
        <div>
          <h2 className="record m-0 mb-3 text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">Latest from Watch</h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {page.watch.slice(0, 4).map((entry) => (
              <li key={entry.slug}>
                <Link href={entryPath(entry)} className="no-underline hover:underline">{entry.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {page.projects.length > 0 && (
        <div>
          <h2 className="record m-0 mb-3 text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">Projects</h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {page.projects.map((project) => (
              <li key={project.slug}>
                <Link href={projectPath(project)} className="no-underline hover:underline">{project.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {page.topics.length > 0 && (
        <div>
          <h2 className="record m-0 mb-3 text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">Topics</h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {page.topics.map((topic) => (
              <li key={topic.slug}>
                <Link href={topicPath(topic.slug)} className="no-underline hover:underline">{topic.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
