import { describe, expect, it } from "vitest";
import { ContentError, validateEntry, validateProject } from "@/content/validate";

const base = { summary: "One or two sentences.", title: "A title", kind: "essay" };

describe("validateEntry", () => {
  it("accepts a minimal essay", () => {
    expect(validateEntry("e.md", base).kind).toBe("essay");
  });

  it("names the file and the missing field", () => {
    expect(() => validateEntry("content/entries/e.md", { ...base, summary: undefined }))
      .toThrow(/^content\/entries\/e\.md: .*summary/);
  });

  it("rejects an unknown kind", () => {
    expect(() => validateEntry("e.md", { ...base, kind: "podcast" }))
      .toThrow(/kind "podcast" is not one of essay, note, link, video/);
  });

  it("requires a title for everything except a note", () => {
    expect(() => validateEntry("e.md", { ...base, title: undefined })).toThrow(/requires "title"/);
    const note = validateEntry("n.md", { summary: "s", kind: "note" });
    expect(note.title).toBeUndefined();
  });

  it("requires url and source on a link", () => {
    expect(() => validateEntry("l.md", { ...base, kind: "link", source: "The Verge" }))
      .toThrow(/kind "link" requires "url"/);
    expect(() => validateEntry("l.md", { ...base, kind: "link", url: "https://x.test" }))
      .toThrow(/kind "link" requires "source"/);
    expect(validateEntry("l.md", { ...base, kind: "link", url: "https://x.test", source: "The Verge" }).url)
      .toBe("https://x.test");
  });

  it("requires an id or url and a channel on a video", () => {
    expect(() => validateEntry("v.md", { ...base, kind: "video", channel: "Some Channel" }))
      .toThrow(/kind "video" requires "video_id" or "video_url"/);
    expect(() => validateEntry("v.md", { ...base, kind: "video", video_id: "abc123" }))
      .toThrow(/kind "video" requires "channel"/);
    expect(validateEntry("v.md", { ...base, kind: "video", video_id: "abc123", channel: "Some Channel" }).video_id)
      .toBe("abc123");
  });

  it("rejects a topic that is not in the topic config", () => {
    expect(() => validateEntry("e.md", { ...base, topics: ["local-aii"] }))
      .toThrow(/topic "local-aii" is not defined/);
    expect(validateEntry("e.md", { ...base, topics: ["local-ai"] }).topics).toEqual(["local-ai"]);
  });

  it("rejects a malformed date", () => {
    expect(() => validateEntry("e.md", { ...base, date: "19/10/2026" }))
      .toThrow(/date must be YYYY-MM-DD/);
  });

  it("rejects a non-boolean draft", () => {
    expect(() => validateEntry("e.md", { ...base, draft: "yes" })).toThrow(/draft must be true or false/);
  });

  it("is a ContentError so callers can catch it specifically", () => {
    expect(() => validateEntry("e.md", {})).toThrow(ContentError);
  });

  it("accepts the launch article's frontmatter", () => {
    const launch = {
      kind: "essay",
      title: "The compute is coming back to your desk",
      summary: "Data centers are being blocked in their own neighborhoods.",
      topics: ["local-ai"],
    };
    expect(validateEntry("content/entries/2026-10-19-the-compute-comes-back.md", launch).topics)
      .toEqual(["local-ai"]);
  });
});

describe("validateProject", () => {
  const project = { title: "Manifest", summary: "s", status: "shipped", year: "2026" };

  it("accepts a minimal project", () => {
    expect(validateProject("p.md", project).status).toBe("shipped");
  });

  it("rejects an unknown status", () => {
    expect(() => validateProject("p.md", { ...project, status: "done" }))
      .toThrow(/status "done" is not one of shipped, building, archived/);
  });

  it("requires title, summary, status and year", () => {
    for (const field of ["title", "summary", "status", "year"] as const) {
      expect(() => validateProject("p.md", { ...project, [field]: undefined }))
        .toThrow(new RegExp(`requires "${field}"`));
    }
  });

  it("validates links as label/url pairs", () => {
    expect(validateProject("p.md", { ...project, links: [{ label: "Site", url: "https://x.test" }] })
      .links).toEqual([{ label: "Site", url: "https://x.test" }]);
    expect(() => validateProject("p.md", { ...project, links: [{ label: "Site" }] }))
      .toThrow(/links\[0\] needs both label and url/);
  });
});
