import { describe, expect, it } from "vitest";
import {
  assertUniqueSlugs,
  entryDate,
  noteHeadline,
  parseFilename,
  publishedOnly,
  sortEntries,
  videoCover,
  videoIdOf,
} from "@/content/derive";
import { ContentError } from "@/content/validate";

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

describe("assertUniqueSlugs", () => {
  it("folds case and names the second file", () => {
    const run = () =>
      assertUniqueSlugs([
        { slug: "manifest", file: "content/projects/manifest.md" },
        { slug: "MANIFEST", file: "content/projects/MANIFEST.md" },
      ]);

    expect(run).toThrow(ContentError);
    expect(run).toThrow(/content\/projects\/MANIFEST\.md: duplicate project slug "manifest"/);
  });

  it("accepts distinct slugs", () => {
    expect(() =>
      assertUniqueSlugs([
        { slug: "manifest", file: "a.md" },
        { slug: "other", file: "b.md" },
      ]),
    ).not.toThrow();
  });

  it("labels entry collisions", () => {
    expect(() =>
      assertUniqueSlugs(
        [
          { slug: "hello", file: "entries/2026-01-01-hello.md" },
          { slug: "HELLO", file: "entries/2026-02-01-HELLO.md" },
        ],
        "entry",
      ),
    ).toThrow(/2026-02-01-HELLO\.md: duplicate entry slug "hello"/);
  });
});

describe("videoIdOf", () => {
  it("prefers an explicit video_id", () => {
    expect(videoIdOf({ video_id: "3mx84MRj8lY", video_url: "https://youtu.be/other123456" })).toBe("3mx84MRj8lY");
  });

  it("reads the id out of a watch, short or embed URL", () => {
    expect(videoIdOf({ video_url: "https://www.youtube.com/watch?v=3mx84MRj8lY" })).toBe("3mx84MRj8lY");
    expect(videoIdOf({ video_url: "https://youtu.be/3mx84MRj8lY" })).toBe("3mx84MRj8lY");
    expect(videoIdOf({ video_url: "https://www.youtube.com/embed/3mx84MRj8lY" })).toBe("3mx84MRj8lY");
  });

  it("returns null when there is nothing to read", () => {
    expect(videoIdOf({})).toBeNull();
    expect(videoIdOf({ video_url: "https://vimeo.com/1" })).toBeNull();
  });
});

describe("videoCover", () => {
  it("uses the YouTube thumbnail for a video with no cover", () => {
    expect(videoCover({ kind: "video", video_id: "3mx84MRj8lY" })).toBe(
      "https://i.ytimg.com/vi/3mx84MRj8lY/maxresdefault.jpg",
    );
  });

  it("keeps a cover the author set", () => {
    expect(videoCover({ kind: "video", video_id: "3mx84MRj8lY", cover: "/covers/x.webp" })).toBe("/covers/x.webp");
  });

  it("leaves other kinds and unreadable videos alone", () => {
    expect(videoCover({ kind: "essay" })).toBeUndefined();
    expect(videoCover({ kind: "video", video_url: "https://vimeo.com/1" })).toBeUndefined();
  });
});
