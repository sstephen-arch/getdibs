import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { KINDS, type Kind } from "../src/content/schema";
import { validateEntry } from "../src/content/validate";

/** Nothing here should ever leave an author waiting on a page that may never
 *  answer. Prefill is a convenience, so it gets a short leash. */
const FETCH_TIMEOUT_MS = 5_000;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function youtubeId(url: string): string | null {
  const trimmed = url.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return match ? match[1] : null;
}

const quote = (value: string) => JSON.stringify(value);

export interface ScaffoldOptions {
  date: string;
  body?: string;
  title?: string;
  site?: string;
  image?: string;
  url?: string;
  video_id?: string;
  channel?: string;
}

export function scaffold(kind: Kind, arg: string, options: ScaffoldOptions) {
  const title = options.title ?? arg;
  const slug = slugify(kind === "link" ? title : arg) || "untitled";
  const filename = `${options.date}-${slug}.md`;

  const data: Record<string, unknown> = {
    kind,
    summary: "TODO: one or two sentences that earn the click.",
  };

  if (kind !== "note") data.title = title;

  if (kind === "link") {
    const url = options.url ?? arg;
    let source = options.site;
    if (!source) {
      try {
        source = new URL(url).hostname;
      } catch {
        source = url;
      }
    }
    data.url = url;
    data.source = source;
    if (options.image) data.image = options.image;
  }

  if (kind === "video") {
    data.video_id = options.video_id ?? youtubeId(arg) ?? "";
    data.channel = options.channel ?? "Unknown channel";
  }

  data.topics = [];

  // A scaffold that would fail the build is worse than no scaffold, so the
  // frontmatter goes through the same validator the loader uses before any
  // bytes reach disk.
  validateEntry(filename, data);

  const lines: string[] = ["---", `kind: ${kind}`];

  if (kind !== "note") lines.push(`title: ${quote(title)}`);
  lines.push(`summary: ${quote(data.summary as string)}`);

  if (kind === "link") {
    lines.push(`url: ${quote(data.url as string)}`);
    lines.push(`source: ${quote(data.source as string)}`);
    if (data.image) lines.push(`image: ${quote(data.image as string)}`);
  }

  if (kind === "video") {
    lines.push(`video_id: ${quote(data.video_id as string)}`);
    lines.push(`channel: ${quote(data.channel as string)}`);
  }

  lines.push("topics: []", "---", "");

  const body = options.body ?? (kind === "note" ? arg : "Write here.");
  return {
    filename,
    contents: `${lines.join("\n")}${body}\n`,
  };
}

export function parseOg(html: string): { title?: string; site?: string; image?: string } {
  const meta = (property: string) => {
    const match = html.match(
      new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    );
    return match?.[1];
  };

  const title =
    meta("og:title") ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();

  return {
    ...(title ? { title } : {}),
    ...(meta("og:site_name") ? { site: meta("og:site_name") } : {}),
    ...(meta("og:image") ? { image: meta("og:image") } : {}),
  };
}

export async function fetchOg(url: string): Promise<{ title?: string; site?: string; image?: string }> {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "getdibs/1.0" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return {};
    return parseOg(await response.text());
  } catch {
    return {};
  }
}

/** The date prefix comes from the local clock: this is a CLI writing the file
 *  in front of the author, not a render path running in UTC. */
function localDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function usage(): never {
  console.error("usage: npm run new <essay|note|link|video> <title|text|url>");
  process.exit(1);
}

async function main() {
  const [kindArg, ...rest] = process.argv.slice(2);
  const arg = rest.join(" ");
  const kind = kindArg as Kind;

  if (!kindArg || !arg || !KINDS.includes(kind)) usage();

  const extra: ScaffoldOptions = { date: localDate() };

  if (kind === "link") {
    let parsed: URL;
    try {
      parsed = new URL(arg);
    } catch {
      console.error(`new link: "${arg}" is not an absolute http(s) URL`);
      process.exit(1);
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      console.error(`new link: "${arg}" is not an absolute http(s) URL`);
      process.exit(1);
    }
    Object.assign(extra, await fetchOg(arg), { url: arg });
    if (!extra.title) extra.title = parsed.hostname;
  }

  if (kind === "video") {
    const id = youtubeId(arg);
    if (!id) {
      console.error(
        `new video: expected a YouTube URL or an 11-character video id, got "${arg}"`,
      );
      process.exit(1);
    }
    extra.video_id = id;
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(arg)}`,
        { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
      );
      if (response.ok) {
        const data = (await response.json()) as { title?: string; author_name?: string };
        extra.title = data.title;
        extra.channel = data.author_name;
      }
    } catch {
      /* oEmbed is a convenience. A missing title is a prompt, not a failure. */
    }
  }

  const { filename, contents } = scaffold(kind, arg, extra);
  const dir = "content/entries";
  mkdirSync(dir, { recursive: true });
  const path = join(dir, filename);
  if (existsSync(path)) {
    console.error(`${path} already exists`);
    process.exit(1);
  }

  writeFileSync(path, contents);
  console.log(path);
}

if (process.argv[1]?.endsWith("new.ts")) {
  await main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
