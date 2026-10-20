import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndexList } from "@/components/IndexList";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeader } from "@/components/SectionHeader";
import { SiteShell } from "@/components/SiteShell";
import { topicsInUse } from "@/content/frontpage";
import { loadContent } from "@/content/load";
import { topicPath } from "@/content/routes";
import { TOPICS } from "@/content/schema";
import { SITE } from "@/lib/site";

/* Static export has no runtime, so a topic that is defined but never used must
   emit no page at all. `dynamicParams = false` states that explicitly: only the
   slugs from `generateStaticParams` are served, and anything else 404s. */
export const dynamicParams = false;

export function generateStaticParams() {
  const { entries, projects } = loadContent();
  return topicsInUse(entries, projects).map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = TOPICS.find((item) => item.slug === slug);
  if (!topic) return {};
  return {
    title: topic.name,
    description: topic.description,
    alternates: { canonical: `${SITE.url}${topicPath(topic.slug)}` },
  };
}

/* `params` is a Promise in the App Router this project targets — verified in
   Task 1, Step 1. If the installed version disagrees, follow the docs. */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = TOPICS.find((item) => item.slug === slug);
  if (!topic) notFound();

  const { entries, projects } = loadContent();
  const tagged = [
    ...entries.filter((entry) => entry.topics?.includes(slug)),
  ];
  const taggedProjects = projects.filter((project) => project.topics?.includes(slug));

  return (
    <SiteShell section="topics">
      <IndexList
        path={`~/topics/${topic.slug}`}
        title={topic.name}
        intro={topic.description}
        items={tagged}
        emptyLabel="Nothing filed under this topic yet."
        now={new Date()}
      />
      {taggedProjects.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-8">
          <SectionHeader label="Projects" href="/projects/" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {taggedProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}
    </SiteShell>
  );
}
