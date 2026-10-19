import { describe, expect, it } from "vitest";
import { entryDate, noteHeadline, parseFilename, publishedOnly, sortEntries } from "@/content/derive";

describe("parseFilename", () => {
  it("splits the date prefix from the slug", () => {
    expect(parseFilename("2026-10-19-on-device-inference.md")).toEqual({
      date: "2026-10-19",
      slug: "on-device-inference",
    });
  });

  it("returns null when the name has no date prefix", () => {
    expect(parseFilename("loose-note.md")).toBeNull();
  });
});

describe("entryDate", () => {
  it("uses the filename date by default", () => {
    expect(entryDate("2026-10-19-x.md")).toBe("2026-10-19");
  });

  it("lets an explicit date override the filename", () => {
    expect(entryDate("2026-10-19-x.md", "2026-01-02")).toBe("2026-01-02");
  });

  it("throws on a name with no date and no declared date", () => {
    expect(() => entryDate("loose.md")).toThrow(/needs a YYYY-MM-DD filename prefix/);
  });
});

describe("noteHeadline", () => {
  it("takes the first sentence", () => {
    expect(noteHeadline("Local models got good. This one runs on a laptop."))
      .toBe("Local models got good.");
  });

  it("handles a body with no full stop by truncating", () => {
    const body = "a".repeat(40) + " " + "b".repeat(200);
    const headline = noteHeadline(body);
    expect(headline.endsWith("…")).toBe(true);
    expect(headline.length).toBeLessThanOrEqual(161);
  });

  it("keeps a short body intact", () => {
    expect(noteHeadline("Short.")).toBe("Short.");
  });

  it("collapses whitespace so a multi-line note still has a one-line headline", () => {
    expect(noteHeadline("  Two\n\nlines.  Next. ")).toBe("Two lines.");
  });
});

describe("sortEntries", () => {
  it("sorts newest first and breaks ties by slug", () => {
    const sorted = sortEntries([
      { date: "2026-01-01", slug: "b" },
      { date: "2026-02-01", slug: "a" },
      { date: "2026-01-01", slug: "a" },
    ]);
    expect(sorted.map((e) => `${e.date}/${e.slug}`)).toEqual([
      "2026-02-01/a",
      "2026-01-01/a",
      "2026-01-01/b",
    ]);
  });
});

describe("publishedOnly", () => {
  it("drops drafts and keeps everything else", () => {
    expect(publishedOnly([{ draft: true }, {}, { draft: false }])).toHaveLength(2);
  });
});
