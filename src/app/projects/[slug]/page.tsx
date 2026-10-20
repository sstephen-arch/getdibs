import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StockShell } from "@/components/StockShell";
import { Prose } from "@/components/Prose";
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
    <StockShell stock="reading">
      <article className="mx-auto max-w-3xl px-5 py-10">
        <p className="record m-0 text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">
          {project.status} · {project.year}
          {project.role ? ` · ${project.role}` : ""}
        </p>
        <h1 className="mt-3 mb-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.08] tracking-tight">
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
                  className="inline-block rounded-control border border-border px-3 py-1.5 font-ui text-sm no-underline hover:border-highlight"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="measure">
          <Prose html={await renderMarkdown(project.body)} />
        </div>

        {updates.length > 0 && (
          <section className="mt-12 border-t border-border pt-6">
            <h2 className="m-0 mb-3 font-display text-xl font-semibold">Updates</h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {updates.map((entry) => (
                <li key={entry.slug}>
                  <a href={entryPath(entry)} className="no-underline hover:underline">{entry.title}</a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </StockShell>
  );
}
