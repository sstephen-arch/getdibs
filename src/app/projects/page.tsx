import Link from "next/link";
import { StockShell } from "@/components/StockShell";
import { loadProjects } from "@/content/load";

export const metadata = { title: "Projects" };

export default function Page() {
  const projects = loadProjects();

  return (
    <StockShell stock="wire">
      <section className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="m-0 font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight">Projects</h1>
        <p className="measure mt-3 font-display text-lg text-muted-foreground">
          Things I have built and shipped, with what they are and what happened.
        </p>
        {projects.length === 0 ? (
          <p className="mt-8 font-display text-muted-foreground">Nothing here yet.</p>
        ) : (
          <ul className="mt-8 grid list-none gap-8 border-t border-border p-0 pt-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <li key={project.slug} className="flex flex-col gap-2">
                <p className="record m-0 text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">
                  {project.status} · {project.year}
                </p>
                <h2 className="m-0 font-display text-xl font-semibold">
                  <Link href={`/projects/${project.slug}/`} className="no-underline hover:underline">{project.title}</Link>
                </h2>
                <p className="m-0 text-sm text-muted-foreground">{project.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </StockShell>
  );
}
