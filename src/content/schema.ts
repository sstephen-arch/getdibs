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
    slug: "building",
    name: "Building",
    description:
      "Taking things from an idea to something people can install, and what it costs to get there.",
  },
];

export interface EntryFrontmatter {
  kind: Kind;
  date?: string;
  title?: string;
  summary: string;
  topics?: string[];
  author?: string;
  cover?: string;
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
