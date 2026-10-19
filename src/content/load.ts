import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import {
  assertUniqueSlugs,
  entryDate,
  noteHeadline,
  parseFilename,
  publishedOnly,
  sortEntries,
} from "./derive";
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
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch (error) {
    // A missing directory means nothing has been published yet. Every other
    // failure (permissions, a file where a directory belongs) must still surface.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  return names.filter((name) => name.endsWith(".md")).sort();
}

/** gray-matter throws a bare YAMLException; this puts the file back on the front
 *  so every content failure starts with the path the author needs to fix. */
function parseFrontmatter(file: string, text: string): ReturnType<typeof matter> {
  try {
    return matter(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ContentError(`${file}: ${message}`);
  }
}

export function loadEntries(dir = "content/entries"): Entry[] {
  const entries = markdownFiles(dir).map((name): Entry => {
    const file = join(dir, name);
    const raw = parseFrontmatter(file, readFileSync(file, "utf8"));
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

  assertUniqueSlugs(entries, "entry");

  return sortEntries(publishedOnly(entries));
}

export function loadProjects(dir = "content/projects"): Project[] {
  const projects = markdownFiles(dir).map((name): Project => {
    const file = join(dir, name);
    const raw = parseFrontmatter(file, readFileSync(file, "utf8"));
    const front = validateProject(file, raw.data);
    const slug = name.replace(/\.md$/, "").toLowerCase();
    return { ...front, slug, body: raw.content.trim(), file };
  });

  assertUniqueSlugs(projects, "project");

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
