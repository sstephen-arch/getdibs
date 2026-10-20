import Link from "next/link";
import { IndexHeader } from "@/components/IndexList";
import { SiteShell } from "@/components/SiteShell";
import { topicsInUse } from "@/content/frontpage";
import { loadContent } from "@/content/load";
import { topicPath } from "@/content/routes";

export const metadata = { title: "Topics" };

export default function Page() {
  const { entries, projects } = loadContent();
  const topics = topicsInUse(entries, projects);

  return (
    <SiteShell section="topics">
      <section className="mx-auto max-w-6xl px-5 py-12">
        <IndexHeader path="~/topics" title="Topics" intro="The desks this site files under." />
        {topics.length === 0 ? (
          <p className="mt-8 font-display text-muted-foreground">No topics in use yet.</p>
        ) : (
          <ul className="mt-8 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <li
                key={topic.slug}
                className="group relative flex flex-col gap-2 rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                <h2 className="m-0 font-display text-2xl font-semibold">
                  <Link
                    href={topicPath(topic.slug)}
                    className="no-underline after:absolute after:inset-0 after:content-['']"
                  >
                    {topic.name}
                  </Link>
                </h2>
                <p className="m-0 text-sm leading-relaxed text-muted-foreground">{topic.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </SiteShell>
  );
}
