import { describe, expect, it } from "vitest";
import { assembleFrontPage, MINIMUMS, pickLead, topicsInUse } from "@/content/frontpage";
import { TOPICS } from "@/content/schema";
import { entries as makeEntries, entry, project } from "../helpers/fixtures";

const assembled = (n: number) => {
  const page = assembleFrontPage(makeEntries(n), [], TOPICS);
  if (page.state !== "assembled") throw new Error("expected assembled");
  return page;
};

function build(
  items: Parameters<typeof assembleFrontPage>[0],
  projects: Parameters<typeof assembleFrontPage>[1] = [],
  topics = TOPICS,
) {
  const page = assembleFrontPage(items, projects, topics);
  if (page.state !== "assembled") throw new Error("expected assembled");
  return page;
}

describe("assembleFrontPage — volume", () => {
  it("returns an empty state with no content", () => {
    expect(assembleFrontPage([], [], TOPICS)).toEqual({ state: "empty" });
  });

  it("renders a lead alone when there is one item", () => {
    const page = assembled(1);
    expect(page.lead.slug).toBe("e0");
    expect(page.bunks).toEqual([]);
    expect(page.feed).toEqual([]);
  });

  it("never strands the second item: it falls through to the feed", () => {
    const page = assembled(2);
    expect(page.lead.slug).toBe("e0");
    expect(page.bunks).toEqual([]);
    expect(page.feed.map((e) => e.slug)).toEqual(["e1"]);
  });

  it("uses lead plus two bunks at three items, with no feed", () => {
    const page = assembled(3);
    expect(page.bunks).toHaveLength(2);
    expect(page.feed).toEqual([]);
  });

  it("uses lead plus three bunks at four items", () => {
    expect(assembled(4).bunks).toHaveLength(3);
  });

  it("leaves one item in the feed at five items", () => {
    const page = assembled(5);
    expect(page.bunks).toHaveLength(3);
    expect(page.feed).toHaveLength(1);
  });

  it("keeps every item exactly once across lead, bunks and feed", () => {
    for (const n of [1, 2, 3, 4, 5, 30]) {
      const page = assembled(n);
      const slugs = [page.lead.slug, ...page.bunks.map((e) => e.slug), ...page.feed.map((e) => e.slug)];
      expect(new Set(slugs).size).toBe(n);
    }
  });

  it("caps bunks at three even at thirty items", () => {
    const page = assembled(30);
    expect(page.bunks).toHaveLength(3);
    expect(page.feed).toHaveLength(26);
  });

  it("keeps the feed newest first at thirty items", () => {
    const dates = assembled(30).feed.map((e) => e.date);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });

  it("produces the same page regardless of input order", () => {
    const forward = build(makeEntries(5));
    const reversed = build([...makeEntries(5)].reverse());
    expect(reversed.lead.slug).toBe(forward.lead.slug);
    expect(reversed.bunks.map((e) => e.slug)).toEqual(forward.bunks.map((e) => e.slug));
    expect(reversed.feed.map((e) => e.slug)).toEqual(forward.feed.map((e) => e.slug));
  });

  it("breaks equal-date ties by slug, ascending", () => {
    const page = build([
      entry({ slug: "b", date: "2026-10-19" }),
      entry({ slug: "a", date: "2026-10-19" }),
    ]);
    expect(page.lead.slug).toBe("a");
    expect(page.feed.map((e) => e.slug)).toEqual(["b"]);
  });
});

describe("assembleFrontPage — lead precedence", () => {
  it("honours an explicit lead even when it is not the newest", () => {
    const items = makeEntries(3);
    items[2].lead = true;
    expect(pickLead(items).slug).toBe(items[2].slug);
  });

  it("prefers the newest essay over a newer note", () => {
    const items = [entry({ slug: "note", kind: "note", date: "2026-10-19" }),
                   entry({ slug: "essay", kind: "essay", date: "2026-10-01" })];
    expect(pickLead(items).slug).toBe("essay");
  });

  it("falls back to the newest item of any kind", () => {
    const items = [entry({ slug: "a", kind: "note", date: "2026-10-18" }),
                   entry({ slug: "b", kind: "video", date: "2026-10-19" })];
    expect(pickLead(items).slug).toBe("b");
  });

  it("picks the newest essay even when the input is not sorted", () => {
    const items = [
      entry({ slug: "older", kind: "essay", date: "2026-09-01" }),
      entry({ slug: "newer", kind: "essay", date: "2026-10-01" }),
    ];
    expect(pickLead(items).slug).toBe("newer");
  });

  it("honours an explicit lead during assembly and never repeats it", () => {
    const items = makeEntries(5);
    items[3].lead = true;
    const page = build(items);
    expect(page.lead.slug).toBe("e3");
    const others = [...page.bunks, ...page.feed].map((e) => e.slug);
    expect(others).not.toContain("e3");
    expect(others).toHaveLength(4);
  });

  it("never repeats the lead on the watch shelf", () => {
    const page = build([
      entry({ slug: "lead-video", kind: "video", date: "2026-10-19" }),
      ...[1, 2, 3].map((n) => entry({ kind: "video", slug: `v${n}`, date: `2026-10-0${n}` })),
    ]);
    expect(page.lead.slug).toBe("lead-video");
    expect(page.watch.map((e) => e.slug)).toEqual(["v3", "v2", "v1"]);
  });

  it("ignores an explicit lead on a draft", () => {
    const page = build([
      entry({ slug: "live", kind: "note", date: "2026-10-18" }),
      entry({ slug: "draft", kind: "essay", date: "2026-10-19", draft: true, lead: true }),
    ]);
    expect(page.lead.slug).toBe("live");
  });
});

describe("assembleFrontPage — bands and minimums", () => {
  it("states the minimum each band uses", () => {
    expect(MINIMUMS).toEqual({ bunks: 2, feed: 1, watch: 3, projects: 2, topics: 2 });
  });

  it("lets bunks carry mixed kinds in date order", () => {
    const page = build([
      entry({ slug: "lead", kind: "essay", date: "2026-10-19" }),
      entry({ slug: "note", kind: "note", date: "2026-10-18" }),
      entry({ slug: "link", kind: "link", date: "2026-10-17" }),
      entry({ slug: "video", kind: "video", date: "2026-10-16" }),
    ]);
    expect(page.lead.slug).toBe("lead");
    expect(page.bunks.map((e) => e.kind)).toEqual(["note", "link", "video"]);
  });

  it("hides the watch band below three videos", () => {
    const page = assembleFrontPage(
      [...makeEntries(1), entry({ kind: "video", slug: "v1" }), entry({ kind: "video", slug: "v2" })],
      [], TOPICS,
    );
    if (page.state !== "assembled") throw new Error("expected assembled");
    expect(page.watch).toEqual([]);
  });

  it("shows the watch band at three videos, newest first", () => {
    const videos = [1, 2, 3].map((n) => entry({ kind: "video", slug: `v${n}`, date: `2026-10-0${n}` }));
    const page = assembleFrontPage([...makeEntries(1), ...videos], [], TOPICS);
    if (page.state !== "assembled") throw new Error("expected assembled");
    expect(page.watch.map((e) => e.slug)).toEqual(["v3", "v2", "v1"]);
  });

  it("shows four videos once the minimum is met", () => {
    const videos = [1, 2, 3, 4].map((n) => entry({ kind: "video", slug: `v${n}`, date: `2026-10-0${n}` }));
    const page = build([...makeEntries(1), ...videos]);
    expect(page.watch.map((e) => e.slug)).toEqual(["v4", "v3", "v2", "v1"]);
  });

  it("hides the projects band below two projects", () => {
    const page = assembleFrontPage(makeEntries(1), [project()], TOPICS);
    if (page.state !== "assembled") throw new Error("expected assembled");
    expect(page.projects).toEqual([]);
    expect(MINIMUMS.projects).toBe(2);
  });

  it("shows the projects band at exactly two", () => {
    const page = build(makeEntries(1), [project({ slug: "a" }), project({ slug: "b" })]);
    expect(page.projects.map((p) => p.slug)).toEqual(["a", "b"]);
  });

  it("shows the projects band above its minimum", () => {
    const page = build(makeEntries(1), [
      project({ slug: "a" }),
      project({ slug: "b" }),
      project({ slug: "c" }),
    ]);
    expect(page.projects.map((p) => p.slug)).toEqual(["a", "b", "c"]);
  });

  it("hides the topics band unless two topics are actually in use", () => {
    const page = assembleFrontPage(makeEntries(3, { topics: ["local-ai"] }), [], TOPICS);
    if (page.state !== "assembled") throw new Error("expected assembled");
    expect(page.topics).toEqual([]);
  });

  it("lists only topics in use, in config order", () => {
    const used = [
      entry({ slug: "a", topics: ["local-ai"] }),
      project({ slug: "p", topics: ["local-ai"] }),
    ];
    expect(topicsInUse(used as never, []).map((t) => t.slug)).toEqual(["local-ai"]);
  });

  it("shows two topics in config order, not usage order", () => {
    const page = build([
      entry({ slug: "new", topics: ["building"] }),
      entry({ slug: "old", date: "2026-10-01", topics: ["local-ai"] }),
    ]);
    expect(page.topics.map((t) => t.slug)).toEqual(["local-ai", "building"]);
  });

  it("counts topics used only by projects", () => {
    const page = build(makeEntries(1, { topics: ["local-ai"] }), [project({ topics: ["building"] })]);
    expect(page.topics.map((t) => t.slug)).toEqual(["local-ai", "building"]);
  });

  it("uses the topic list it is given", () => {
    const custom = [
      { slug: "one", name: "One", description: "First." },
      { slug: "two", name: "Two", description: "Second." },
    ];
    const page = build(
      [
        entry({ slug: "a", topics: ["two"] }),
        entry({ slug: "b", date: "2026-10-18", topics: ["one"] }),
      ],
      [],
      custom,
    );
    expect(page.topics.map((t) => t.slug)).toEqual(["one", "two"]);
  });
});

describe("assembleFrontPage — drafts", () => {
  it("excludes drafts from every band", () => {
    const items = [entry({ slug: "live", date: "2026-10-19" }),
                   entry({ slug: "draft", date: "2026-10-18", draft: true })];
    const page = assembleFrontPage(items, [], TOPICS);
    if (page.state !== "assembled") throw new Error("expected assembled");
    const slugs = [page.lead.slug, ...page.bunks.map((e) => e.slug), ...page.feed.map((e) => e.slug)];
    expect(slugs).not.toContain("draft");
  });

  it("does not let drafts fill the watch band", () => {
    const page = build([
      entry({ slug: "live", date: "2026-10-19" }),
      entry({ kind: "video", slug: "v1" }),
      entry({ kind: "video", slug: "v2" }),
      entry({ kind: "video", slug: "v3", draft: true }),
    ]);
    expect(page.watch).toEqual([]);
  });

  it("does not count a draft's topics toward the topics band", () => {
    const page = build([
      entry({ slug: "live", topics: ["local-ai"] }),
      entry({ slug: "draft", date: "2026-10-18", topics: ["building"], draft: true }),
    ]);
    expect(page.topics).toEqual([]);
  });

  it("returns the empty state when every entry is a draft", () => {
    expect(assembleFrontPage([entry({ draft: true })], [], TOPICS)).toEqual({ state: "empty" });
  });
});
