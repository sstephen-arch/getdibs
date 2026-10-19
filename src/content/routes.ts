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
