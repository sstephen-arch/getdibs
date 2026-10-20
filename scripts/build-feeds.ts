import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { topicsInUse } from "../src/content/frontpage";
import type { Entry, Project } from "../src/content/load";
import { loadContent } from "../src/content/load";
import { entryPath, projectPath, topicPath } from "../src/content/routes";
import type { Topic } from "../src/content/schema";
import { SITE } from "../src/lib/site";

export const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const absolute = (path: string) => `${SITE.url}${path}`;
const published = (entry: Entry) => new Date(`${entry.date}T12:00:00Z`).toUTCString();

export function buildRss(entries: Entry[], now: Date): string {
  const items = entries
    .map(
      (entry) => `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${absolute(entryPath(entry))}</link>
      <guid isPermaLink="true">${absolute(entryPath(entry))}</guid>
      <pubDate>${published(entry)}</pubDate>
      <description>${escapeXml(entry.summary)}</description>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${SITE.url}/</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

export function buildJsonFeed(entries: Entry[], now: Date): string {
  return JSON.stringify(
    {
      version: "https://jsonfeed.org/version/1.1",
      title: SITE.name,
      home_page_url: `${SITE.url}/`,
      feed_url: `${SITE.url}/feed.json`,
      description: SITE.description,
      items: entries.map((entry) => ({
        id: absolute(entryPath(entry)),
        url: absolute(entryPath(entry)),
        title: entry.title,
        summary: entry.summary,
        date_published: `${entry.date}T12:00:00Z`,
        tags: entry.topics ?? [],
      })),
    },
    null,
    2,
  );
}

export function buildLlms(entries: Entry[], projects: Project[], topics: Topic[]): string {
  const line = (title: string, href: string) => `- [${title}](${absolute(href)})`;
  const section = (heading: string, rows: string[]) =>
    rows.length === 0 ? "" : `\n## ${heading}\n\n${rows.join("\n")}\n`;

  return `# ${SITE.name}

> ${SITE.description}

Everything on this site is written by ${SITE.author}. Essays are long-form, notes
are short, and the watch shelf is curated rather than exhaustive.

${section("Essays", entries.filter((e) => e.kind === "essay").map((e) => line(e.title, entryPath(e))))}${section(
    "Notes and links",
    entries.filter((e) => e.kind === "note" || e.kind === "link").map((e) => line(e.title, entryPath(e))),
  )}${section("Watch", entries.filter((e) => e.kind === "video").map((e) => line(e.title, entryPath(e))))}${section(
    "Projects",
    projects.map((p) => line(p.title, projectPath(p))),
  )}${section("Topics", topics.map((t) => `${line(t.name, topicPath(t.slug))} — ${t.description}`))}`;
}

export function buildSitemap(entries: Entry[], projects: Project[], topics: Topic[]): string {
  const paths = [
    "/", "/essays/", "/notes/", "/watch/", "/projects/", "/topics/", "/archive/", "/about/", "/subscribe/",
    ...entries.map(entryPath),
    ...projects.map(projectPath),
    ...topics.map((topic) => topicPath(topic.slug)),
  ];

  const urls = paths
    .map((path) => `  <url>\n    <loc>${absolute(path)}</loc>\n  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/** Everything written into public/ at build time. Returned rather than written so
 *  the tests can assert the strings without touching the filesystem. */
export function buildAll(root = "content"): Record<string, string> {
  const { entries, projects } = loadContent(root);
  const topics = topicsInUse(entries, projects);
  const now = new Date();

  return {
    "feed.xml": buildRss(entries, now),
    "feed.json": buildJsonFeed(entries, now),
    "llms.txt": buildLlms(entries, projects, topics),
    "sitemap.xml": buildSitemap(entries, projects, topics),
  };
}

function main() {
  mkdirSync("public", { recursive: true });
  for (const [name, contents] of Object.entries(buildAll())) {
    writeFileSync(join("public", name), contents);
    console.log(`wrote public/${name}`);
  }
}

if (process.argv[1]?.endsWith("build-feeds.ts")) main();
