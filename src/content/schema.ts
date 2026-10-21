export const KINDS = ["essay", "note", "link", "video"] as const;
export type Kind = (typeof KINDS)[number];

export const PROJECT_STATUSES = ["shipped", "building", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Topic {
  slug: string;
  name: string;
  description: string;
}

/** Desks. A topic that is defined but never used generates no page, and a topic
 *  used in frontmatter but not defined here fails the build. Two are required for
 *  the front page's topics band to render at all (MINIMUMS.topics === 2), so the
 *  site ships with the two desks it actually writes in. */
export const TOPICS: Topic[] = [
  {
    slug: "local-ai",
    name: "Local AI",
    description:
      "Models that run on hardware you own, and what that changes about what you can build.",
  },
  {
    slug: "claude-code",
    name: "Claude Code",
    description:
      "Building with an AI agent every day: what it costs, how the work actually flows, and what holds up.",
  },
  {
    slug: "building",
    name: "Building",
    description:
      "Taking things from an idea to something people can install, and what it costs to get there.",
  },
];

/** One figure in an item's "by the numbers" strip. `value` is printed large,
 *  `label` under it, and `detail` (optional) says where the number comes from. */
export interface EntryStat {
  value: string;
  label: string;
  detail?: string;
}

export interface EntryFrontmatter {
  kind: Kind;
  date?: string;
  title?: string;
  summary: string;
  topics?: string[];
  author?: string;
  /** Root-relative path under public/ (e.g. "/covers/x.webp") or an absolute URL. */
  cover?: string;
  /** What the cover shows, for the article page where it is not decoration. */
  cover_alt?: string;
  /** Who made the cover and under what licence, printed under it. */
  cover_credit?: string;
  /** Up to four figures shown under the standfirst, for the credibility of a piece. */
  stats?: EntryStat[];
  /** The short version: one to five points printed in a box under the headline,
   *  in place of the standfirst, for a reader deciding whether to read on. */
  takeaways?: string[];
  /** Who the piece is for, printed as a chip, e.g. "IT and security leads". */
  audience?: string;
  /** The day every claim was last checked against its source (YYYY-MM-DD). */
  checked?: string;
  lead?: boolean;
  draft?: boolean;
  updated?: string;
  project?: string;
  /* link */
  url?: string;
  source?: string;
  image?: string;
  /* video */
  video_id?: string;
  video_url?: string;
  channel?: string;
  duration?: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectFrontmatter {
  title: string;
  summary: string;
  status: ProjectStatus;
  year: string;
  role?: string;
  stack?: string[];
  links?: ProjectLink[];
  topics?: string[];
  cover?: string;
  /** Pins a project above the rest of the index. Used for the repositories that
   *  are public and open source, so the ones a reader can actually go and read
   *  are the ones they meet first. Ordering inside each group is still newest
   *  year, then slug. */
  featured?: boolean;
}
