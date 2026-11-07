import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { Prose } from "@/components/Prose";
import { StatusPill } from "@/components/ProjectCard";
import { SectionHeader } from "@/components/SectionHeader";
import { loadContent } from "@/content/load";
import { renderMarkdown } from "@/content/render";
import { entryPath, placeholderSlug } from "@/content/routes";
import { projectMetadata } from "@/lib/og";
import { SITE } from "@/lib/site";

export const dynamicParams = false;

function findProject(slug: string) {
  return loadContent().projects.find((item) => item.slug === slug);
}

export function generateStaticParams() {
  const slugs = loadContent().projects.map((project) => ({ slug: project.slug }));
  return slugs.length > 0 ? slugs : [{ slug: placeholderSlug("projects") }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  return project ? projectMetadata(project) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { entries, projects } = loadContent();
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const updates = entries.filter((entry) => entry.project === project.slug);

  return (
    <SiteShell section="projects">
      <article className="mx-auto max-w-3xl px-5 py-10">
        <nav aria-label="Breadcrumb" className="record mb-6 text-[0.75rem] text-muted-foreground">
          <Link href="/" className="no-underline hover:text-primary">~</Link>
          {" / "}
          <Link href="/projects/" className="no-underline hover:text-primary">projects</Link>
          {" / "}
          <span className="text-foreground">{project.slug}</span>
        </nav>
        <StatusPill project={project} />
        <h1 className="mt-4 mb-3 font-display text-[clamp(2.25rem,5.5vw,3.75rem)] font-bold leading-[0.98] tracking-[-0.04em]">
          {project.title}
        </h1>
        {/* Projects have no author field: they are all this author's, and saying
            so is the point. */}
        <p className="m-0 mb-5 font-ui text-sm text-muted-foreground">
          {"By "}
          <span className="font-medium text-foreground">{SITE.author}</span>
        </p>
        <p className="measure m-0 mb-6 font-display text-xl leading-relaxed text-muted-foreground">
          {project.summary}
        </p>

        {project.links && project.links.length > 0 && (
          <ul className="m-0 mb-8 flex list-none flex-wrap gap-3 p-0">
            {project.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-border bg-card px-3 py-1.5 font-ui text-sm font-bold no-underline transition-colors hover:bg-highlight"
                >
                  {link.label}
                  <span aria-hidden className="text-muted-foreground">↗</span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {project.body && (
          <div className="measure border-t border-border pt-8">
            <Prose html={await renderMarkdown(project.body)} />
          </div>
        )}

        {updates.length > 0 && (
          <section className="mt-12">
            <SectionHeader label="Updates" />
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {updates.map((entry) => (
                <li key={entry.slug}>
                  <Link href={entryPath(entry)} className="no-underline hover:text-primary">{entry.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="measure mt-14 mb-0 border-t border-border pt-6 font-ui text-sm text-muted-foreground">
          <Link href="/projects/" className="no-underline hover:text-primary">← All projects</Link>
        </p>
      </article>
    </SiteShell>
  );
}
