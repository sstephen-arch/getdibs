import { describe, expect, it, vi } from "vitest";
import { fetchOg, parseOg, scaffold, slugify, youtubeId } from "../../scripts/new";

describe("slugify", () => {
  it("makes a url-safe slug", () => {
    expect(slugify("On-device inference: what changed?")).toBe("on-device-inference-what-changed");
  });
});

describe("scaffold", () => {
  const opts = { date: "2026-10-19", body: "Body." };

  it("scaffolds an essay with valid frontmatter", () => {
    const { filename, contents } = scaffold("essay", "On-device inference", opts);
    expect(filename).toBe("2026-10-19-on-device-inference.md");
    expect(contents).toContain("kind: essay");
    expect(contents).toContain('title: "On-device inference"');
    expect(contents).toContain("summary:");
  });

  it("scaffolds a note with no title, so the body becomes the headline", () => {
    const { contents } = scaffold("note", "First sentence. Second.", opts);
    expect(contents).not.toContain("title:");
    expect(contents).toContain("kind: note");
  });

  it("scaffolds a link with url and source", () => {
    const { contents } = scaffold("link", "https://x.test/a", {
      ...opts,
      url: "https://x.test/a",
      title: "Worth reading",
      site: "X",
    });
    expect(contents).toContain("kind: link");
    expect(contents).toContain('url: "https://x.test/a"');
    expect(contents).toContain('source: "X"');
  });

  it("scaffolds a video with id and channel", () => {
    const { contents } = scaffold("video", "https://youtube.com/watch?v=abc123", {
      ...opts,
      video_id: "abc123",
      channel: "Some Channel",
      title: "A talk",
    });
    expect(contents).toContain("kind: video");
    expect(contents).toContain('video_id: "abc123"');
    expect(contents).toContain('channel: "Some Channel"');
  });

  it("rejects a video scaffold that would fail validateEntry", () => {
    expect(() => scaffold("video", "not a video", opts)).toThrow(/video_id/);
  });
});

describe("youtubeId", () => {
  it("reads every common youtube url shape", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=abc123")).toBe("abc123");
    expect(youtubeId("https://youtu.be/abc123")).toBe("abc123");
    expect(youtubeId("https://www.youtube.com/embed/abc123")).toBe("abc123");
    expect(youtubeId("https://example.com/not-video")).toBeNull();
  });

  it("accepts a bare 11-character id and rejects malformed input", () => {
    expect(youtubeId("abc123def45")).toBe("abc123def45");
    expect(youtubeId("not-an-id")).toBeNull();
  });
});

describe("parseOg", () => {
  it("reads og tags", () => {
    const html = `<meta property="og:title" content="A title"><meta property="og:site_name" content="The Verge"><meta property="og:image" content="https://x.test/i.png">`;
    expect(parseOg(html)).toEqual({ title: "A title", site: "The Verge", image: "https://x.test/i.png" });
  });

  it("falls back to the <title> tag and survives a page with no og tags", () => {
    expect(parseOg("<title>Plain title</title>").title).toBe("Plain title");
    expect(parseOg("<html></html>")).toEqual({});
  });
});

describe("fetchOg", () => {
  it("returns an empty object instead of throwing when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(fetchOg("https://x.test/a")).resolves.toEqual({});
    vi.unstubAllGlobals();
  });
});
