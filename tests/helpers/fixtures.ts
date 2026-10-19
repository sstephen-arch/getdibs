import type { Entry, Project } from "@/content/load";
import type { Kind } from "@/content/schema";

let counter = 0;

export function entry(overrides: Partial<Entry> & { kind?: Kind } = {}): Entry {
  counter += 1;
  const kind = overrides.kind ?? "note";
  return {
    kind,
    slug: overrides.slug ?? `entry-${counter}`,
    date: overrides.date ?? "2026-10-01",
    title: overrides.title ?? `Entry ${counter}`,
    titleDerived: false,
    summary: overrides.summary ?? "A summary.",
    body: overrides.body ?? "Body.",
    file: overrides.file ?? `content/entries/${overrides.slug ?? counter}.md`,
    ...overrides,
  } as Entry;
}

export function project(overrides: Partial<Project> = {}): Project {
  counter += 1;
  return {
    title: overrides.title ?? `Project ${counter}`,
    summary: overrides.summary ?? "A project.",
    status: overrides.status ?? "shipped",
    year: overrides.year ?? "2026",
    slug: overrides.slug ?? `project-${counter}`,
    body: overrides.body ?? "Body.",
    file: overrides.file ?? `content/projects/${overrides.slug ?? counter}.md`,
    ...overrides,
  } as Project;
}

/** n entries, newest first, dates descending from 2026-10-19. Dates stay valid
 *  ISO days past 2026-10-01 (the 30-item fixtures roll back into September), so
 *  component tests can format them without hitting an invalid Date. */
export function entries(n: number, overrides: Partial<Entry> = {}): Entry[] {
  return Array.from({ length: n }, (_, i) => {
    const date = new Date(Date.UTC(2026, 9, 19 - i)).toISOString().slice(0, 10);
    return entry({ slug: `e${i}`, date, ...overrides });
  });
}
