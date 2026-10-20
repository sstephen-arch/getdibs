import Link from "next/link";
import type { Project } from "@/content/load";
import { projectPath } from "@/content/routes";

const STATUS_DOT: Record<Project["status"], string> = {
  shipped: "bg-live",
  building: "bg-highlight",
  archived: "bg-muted-foreground",
};

/** Status as a build light: green for shipped, amber while building, grey once
 *  archived. The word is always printed next to the dot, so colour is never the
 *  only signal. */
export function StatusPill({ project }: { project: Project }) {
  return (
    <span className="record inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
      <span aria-hidden className={`size-2 rounded-full ${STATUS_DOT[project.status]}`} />
      {project.status} · {project.year}
      {project.role ? ` · ${project.role}` : ""}
    </span>
  );
}

export function ProjectCard({ project, as: Heading = "h3" }: { project: Project; as?: "h2" | "h3" }) {
  return (
    <article className="group relative flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/50">
      <StatusPill project={project} />
      <Heading className="m-0 font-display text-xl font-semibold leading-snug">
        <Link
          href={projectPath(project)}
          className="no-underline after:absolute after:inset-0 after:content-[''] group-hover:text-primary"
        >
          {project.title}
        </Link>
      </Heading>
      <p className="m-0 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>
      {project.links && project.links.length > 0 && (
        <p className="record m-0 mt-auto pt-1 text-[0.6875rem] text-muted-foreground">
          {project.links.map((link) => link.label.toLowerCase()).join(" · ")}
        </p>
      )}
    </article>
  );
}
