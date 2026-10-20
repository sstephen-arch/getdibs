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

/** Every content failure names the path it failed on, so a permission or
 *  wrong-type error still begins with the directory the author must fix. */
function contentFailure(path: string, error: unknown): ContentError {
  const message = error instanceof Error ? error.message : String(error);
  return new ContentError(`${path}: ${message}`);
}

function markdownFiles(dir: string): string[] {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch (error) {
    // A missing directory means nothing has been published yet. Every other
    // failure (permissions, a file where a directory belongs) must still surface.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw contentFailure(dir, error);
  }
  return names.filter((name) => name.endsWith(".md")).sort();
}

/** Reading is IO, not parsing: a failure here is named with the path but never
 *  relabelled as a YAML problem. */
function readText(file: string): string {
  try {
    return readFileSync(file, "utf8");
  } catch (error) {
    throw contentFailure(file, error);
  }
}

/** gray-matter throws a bare YAMLException; this puts the file back on the front
 *  so every content failure starts with the path the author needs to fix. */
function parseFrontmatter(file: string, text: string): ReturnType<typeof matter> {
  try {
    return matter(text);
  } catch (error) {
    throw contentFailure(file, error);
  }
}

export function loadEntries(dir = "content/entries"): Entry[] {
  const entries = markdownFiles(dir).map((name): Entry => {
    const file = join(dir, name);
    const raw = parseFrontmatter(file, readText(file));
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
    const raw = parseFrontmatter(file, readText(file));
    const front = validateProject(file, raw.data);
    const slug = name.replace(/\.md$/, "").toLowerCase();
    return { ...front, slug, body: raw.content.trim(), file };
  });

  assertUniqueSlugs(projects, "project");

  /* Featured first, so the repositories a reader can actually open are the ones
     they meet first; then newest year, then slug. */
  return projects.sort(
    (a, b) =>
      Number(b.featured ?? false) - Number(a.featured ?? false) ||
      b.year.localeCompare(a.year) ||
      a.slug.localeCompare(b.slug),
  );
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
