import Link from "next/link";
import type { FrontPage } from "@/content/frontpage";
import { entryPath, projectPath, topicPath } from "@/content/routes";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <h2 className="eyebrow m-0 mb-3">{title}</h2>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">{children}</ul>
    </div>
  );
}

/** Built from whatever exists. A section with nothing in it contributes no block
 *  and no apology line; with nothing at all, the rail renders nothing. */
export function Rail({ page }: { page: Extract<FrontPage, { state: "assembled" }> }) {
  if (page.watch.length === 0 && page.projects.length === 0 && page.topics.length === 0) {
    return null;
  }

  return (
    <aside data-band="rail" className="flex flex-col gap-5 font-ui text-sm">
      {page.watch.length > 0 && (
        <Block title="Latest from Watch">
          {page.watch.slice(0, 4).map((entry) => (
            <li key={entry.slug}>
              <Link href={entryPath(entry)} className="no-underline hover:text-primary">{entry.title}</Link>
            </li>
          ))}
        </Block>
      )}
      {page.projects.length > 0 && (
        <Block title="Projects">
          {page.projects.map((project) => (
            <li key={project.slug}>
              <Link href={projectPath(project)} className="no-underline hover:text-primary">{project.title}</Link>
            </li>
          ))}
        </Block>
      )}
      {page.topics.length > 0 && (
        <Block title="Topics">
          {page.topics.map((topic) => (
            <li key={topic.slug}>
              <Link href={topicPath(topic.slug)} className="no-underline hover:text-primary">{topic.name}</Link>
            </li>
          ))}
        </Block>
      )}
    </aside>
  );
}
