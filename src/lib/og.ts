import type { Metadata } from "next";
import type { Entry, Project } from "@/content/load";
import { entryPath, projectPath } from "@/content/routes";
import { SITE } from "./site";

/** The one place an item describes itself to a crawler. Title stays a plain
 *  string so the root layout's template (`%s · DIBS`) applies once, in one place. */
export function itemMetadata(entry: Entry): Metadata {
  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: `${SITE.url}${entryPath(entry)}` },
    openGraph: {
      type: "article",
      title: entry.title,
      description: entry.summary,
      url: `${SITE.url}${entryPath(entry)}`,
      publishedTime: entry.date,
      ...(entry.updated ? { modifiedTime: entry.updated } : {}),
      /* No cover, no image. A text-only preview is honest; a generated one would
         need a font binary and a rasteriser in the build (see the plan's
         amendments). */
      ...(entry.cover ? { images: [{ url: entry.cover }] } : {}),
    },
  };
}

export function projectMetadata(project: Project): Metadata {
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `${SITE.url}${projectPath(project)}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary,
      url: `${SITE.url}${projectPath(project)}`,
      ...(project.cover ? { images: [{ url: project.cover }] } : {}),
    },
  };
}
