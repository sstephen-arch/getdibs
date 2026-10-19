import {
  KINDS,
  PROJECT_STATUSES,
  TOPICS,
  type EntryFrontmatter,
  type Kind,
  type ProjectFrontmatter,
  type ProjectLink,
} from "./schema";

export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function fail(file: string, message: string): never {
  throw new ContentError(`${file}: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(file: string, data: Record<string, unknown>, field: string): string | undefined {
  const value = data[field];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim() === "") {
    fail(file, `"${field}" must be a non-empty string`);
  }
  return value;
}

function requiredString(file: string, data: Record<string, unknown>, field: string): string {
  return optionalString(file, data, field) ?? fail(file, `requires "${field}"`);
}

function optionalDate(file: string, data: Record<string, unknown>, field: string): string | undefined {
  const value = optionalString(file, data, field);
  if (value === undefined) return undefined;
  if (!ISO_DATE.test(value)) fail(file, `${field} must be YYYY-MM-DD, got "${value}"`);
  return value;
}

function optionalBoolean(file: string, data: Record<string, unknown>, field: string): boolean | undefined {
  const value = data[field];
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") fail(file, `${field} must be true or false`);
  return value;
}

function optionalTopics(file: string, data: Record<string, unknown>): string[] | undefined {
  const value = data.topics;
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((t) => typeof t !== "string")) {
    fail(file, `"topics" must be a list of topic slugs`);
  }
  for (const topic of value as string[]) {
    if (!TOPICS.some((t) => t.slug === topic)) {
      fail(file, `topic "${topic}" is not defined in src/content/schema.ts`);
    }
  }
  return value as string[];
}

export function validateEntry(file: string, input: unknown): EntryFrontmatter {
  if (!isRecord(input)) fail(file, "frontmatter is missing");

  const kind = input.kind;
  if (typeof kind !== "string" || !KINDS.includes(kind as Kind)) {
    fail(file, `kind "${String(kind)}" is not one of ${KINDS.join(", ")}`);
  }

  const summary = requiredString(file, input, "summary");
  const title = optionalString(file, input, "title");
  if (title === undefined && kind !== "note") {
    fail(file, `kind "${kind}" requires "title"`);
  }

  if (kind === "link") {
    if (!optionalString(file, input, "url")) fail(file, `kind "link" requires "url"`);
    if (!optionalString(file, input, "source")) fail(file, `kind "link" requires "source"`);
  }

  if (kind === "video") {
    if (!optionalString(file, input, "video_id") && !optionalString(file, input, "video_url")) {
      fail(file, `kind "video" requires "video_id" or "video_url"`);
    }
    if (!optionalString(file, input, "channel")) fail(file, `kind "video" requires "channel"`);
  }

  return {
    kind: kind as Kind,
    date: optionalDate(file, input, "date"),
    title,
    summary,
    topics: optionalTopics(file, input),
    author: optionalString(file, input, "author"),
    cover: optionalString(file, input, "cover"),
    lead: optionalBoolean(file, input, "lead"),
    draft: optionalBoolean(file, input, "draft"),
    updated: optionalDate(file, input, "updated"),
    project: optionalString(file, input, "project"),
    url: optionalString(file, input, "url"),
    source: optionalString(file, input, "source"),
    image: optionalString(file, input, "image"),
    video_id: optionalString(file, input, "video_id"),
    video_url: optionalString(file, input, "video_url"),
    channel: optionalString(file, input, "channel"),
    duration: optionalString(file, input, "duration"),
  };
}

export function validateProject(file: string, input: unknown): ProjectFrontmatter {
  if (!isRecord(input)) fail(file, "frontmatter is missing");

  const status = input.status;
  if (status === undefined) fail(file, `requires "status"`);
  if (typeof status !== "string" || !PROJECT_STATUSES.includes(status as never)) {
    fail(file, `status "${String(status)}" is not one of ${PROJECT_STATUSES.join(", ")}`);
  }

  let links: ProjectLink[] | undefined;
  if (input.links !== undefined) {
    if (!Array.isArray(input.links)) fail(file, `"links" must be a list`);
    links = input.links.map((item, index) => {
      if (!isRecord(item) || typeof item.label !== "string" || typeof item.url !== "string") {
        fail(file, `links[${index}] needs both label and url`);
      }
      return { label: item.label as string, url: item.url as string };
    });
  }

  const stack = input.stack;
  if (stack !== undefined && (!Array.isArray(stack) || stack.some((s) => typeof s !== "string"))) {
    fail(file, `"stack" must be a list of strings`);
  }

  return {
    title: requiredString(file, input, "title"),
    summary: requiredString(file, input, "summary"),
    status: status as ProjectFrontmatter["status"],
    year: requiredString(file, input, "year"),
    role: optionalString(file, input, "role"),
    stack: stack as string[] | undefined,
    links,
    topics: optionalTopics(file, input),
    cover: optionalString(file, input, "cover"),
  };
}
