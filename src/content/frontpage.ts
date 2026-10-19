import { publishedOnly, sortEntries } from "./derive";
import type { Entry, Project } from "./load";
import { TOPICS, type Topic } from "./schema";

export const MINIMUMS = {
  bunks: 2,
  feed: 1,
  watch: 3,
  projects: 2,
  topics: 2,
} as const;

export type FrontPage =
  | { state: "empty" }
  | {
      state: "assembled";
      lead: Entry;
      bunks: Entry[];
      feed: Entry[];
      watch: Entry[];
      projects: Project[];
      topics: Topic[];
    };

/** Explicit override first, then the newest essay, then the newest anything.
 *  Equal dates break by slug, ascending (see sortEntries). Drafts are never
 *  candidates. Never throws; the empty corpus returns undefined, so callers
 *  guard it (assembleFrontPage does). */
export function pickLead(entries: Entry[]): Entry {
  const live = sortEntries(publishedOnly(entries));
  return (
    live.find((entry) => entry.lead) ??
    live.find((entry) => entry.kind === "essay") ??
    live[0]
  );
}

export function topicsInUse(
  entries: Entry[],
  projects: Project[],
  topics: Topic[] = TOPICS,
): Topic[] {
  const used = new Set<string>();
  for (const item of [...entries, ...projects]) {
    for (const topic of item.topics ?? []) used.add(topic);
  }
  return topics.filter((topic) => used.has(topic.slug));
}

/** The front page assembles itself from what is real. Two rules keep it honest:
 *  a band below its minimum does not render, and no item is ever stranded —
 *  bunks take at most three of the items left after the lead, and the feed
 *  catches everything else. */
export function assembleFrontPage(
  entries: Entry[],
  projects: Project[],
  topics: Topic[] = TOPICS,
): FrontPage {
  const live = sortEntries(publishedOnly(entries));
  if (live.length === 0) return { state: "empty" };

  const lead = pickLead(live);
  const pool = live.filter((entry) => entry !== lead);

  const bunks = pool.length >= MINIMUMS.bunks ? pool.slice(0, 3) : [];
  const feed = pool.slice(bunks.length);

  /* Watch repeats items already in the feed on purpose: a newsroom front page
     surfaces the same story in more than one block. The lead is never repeated,
     and the lead/bunks/feed partition still holds — every entry appears there
     exactly once. */
  const videos = live.filter((entry) => entry.kind === "video" && entry !== lead).slice(0, 6);
  const watch = videos.length >= MINIMUMS.watch ? videos : [];

  const projectBand = projects.length >= MINIMUMS.projects ? projects.slice(0, 3) : [];

  const inUse = topicsInUse(live, projects, topics);
  const topicBand = inUse.length >= MINIMUMS.topics ? inUse : [];

  return {
    state: "assembled",
    lead,
    bunks,
    feed,
    watch,
    projects: projectBand,
    topics: topicBand,
  };
}
