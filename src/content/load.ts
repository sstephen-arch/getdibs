import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { entryDate, noteHeadline, parseFilename, publishedOnly, sortEntries } from "./derive";
import type { EntryFrontmatter, ProjectFrontmatter } from "./schema";
import { ContentError, validateEntry, validateProject } from "./validate";

export interface Entry extends Omit<EntryFrontmatter, "title"> {
  slug: string;
  date: string;
  title: string;
  titleDerived: boolean;
  body: string;
  file: string;
}

export interface Project extends ProjectFrontmatter {
  slug: string;
  body: string;
  file: string;
}

function markdownFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort();
}

export function loadEntries(dir = "content/entries"): Entry[] {
  const entries = markdownFiles(dir).map((name): Entry => {
    const file = join(dir, name);
    const raw = matter(readFileSync(file, "utf8"));
    const front = validateEntry(file, raw.data);
    const parsed = parseFilename(name);
    if (!parsed) {
      throw new ContentError(`${file}: needs a YYYY-MM-DD filename prefix`);
    }
    const body = raw.content.trim();
    const derived = front.title === undefined;
    return {
      ...front,
      slug: parsed.slug,
      date: entryDate(name, front.date),
      title: front.title ?? noteHeadline(body),
      titleDerived: derived,
      body,
      file,
    };
  });

  return sortEntries(publishedOnly(entries));
}

export function loadProjects(dir = "content/projects"): Project[] {
  const seen = new Set<string>();
  const projects = markdownFiles(dir).map((name): Project => {
    const file = join(dir, name);
    const raw = matter(readFileSync(file, "utf8"));
    const front = validateProject(file, raw.data);
    const slug = name.replace(/\.md$/, "").toLowerCase();
    if (seen.has(slug)) {
      throw new ContentError(`${file}: duplicate project slug "${slug}"`);
    }
    seen.add(slug);
    return { ...front, slug, body: raw.content.trim(), file };
  });

  return projects.sort((a, b) => b.year.localeCompare(a.year) || a.slug.localeCompare(b.slug));
}

export function loadContent(root = "content"): { entries: Entry[]; projects: Project[] } {
  const entries = loadEntries(join(root, "entries"));
  const projects = loadProjects(join(root, "projects"));
  const known = new Set(projects.map((p) => p.slug));

  for (const entry of entries) {
    if (entry.project && !known.has(entry.project)) {
      throw new ContentError(`${entry.file}: project "${entry.project}" does not exist`);
    }
  }

  return { entries, projects };
}
