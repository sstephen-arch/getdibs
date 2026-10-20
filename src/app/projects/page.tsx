import { ProjectCard } from "@/components/ProjectCard";
import { SiteShell } from "@/components/SiteShell";
import { IndexHeader } from "@/components/IndexList";
import { loadProjects } from "@/content/load";

export const metadata = { title: "Projects" };

export default function Page() {
  const projects = loadProjects();
  const shipped = projects.filter((project) => project.status === "shipped").length;

  return (
    <SiteShell section="projects">
      <section className="mx-auto max-w-6xl px-5 py-12">
        <IndexHeader
          path="~/projects"
          title="Projects"
          intro="Things I have built and shipped, with what they are and what happened."
          count={projects.length > 0 ? `${projects.length} projects · ${shipped} shipped` : undefined}
        />
        {projects.length === 0 ? (
          <p className="mt-8 font-display text-muted-foreground">Nothing here yet.</p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} as="h2" />
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
