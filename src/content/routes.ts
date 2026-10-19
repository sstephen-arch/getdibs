import type { Entry, Project } from "./load";

export const SECTION_OF_KIND: Record<Entry["kind"], string> = {
  essay: "essays",
  note: "notes",
  link: "notes",
  video: "watch",
};

export function entryPath(entry: Entry): string {
  return `/${SECTION_OF_KIND[entry.kind]}/${entry.slug}/`;
}

export function projectPath(project: Project): string {
  return `/projects/${project.slug}/`;
}

export function topicPath(slug: string): string {
  return `/topics/${slug}/`;
}

/** `output: export` refuses a dynamic route whose `generateStaticParams` is empty,
 *  so a section with nothing published yet emits one placeholder path. The page
 *  calls `notFound()` for it, and the real slugs replace it as soon as content
 *  exists. The prefix is unlikely to collide with a timestamped slug. */
export function placeholderSlug(section: string): string {
  return `__empty-${section}__`;
}
