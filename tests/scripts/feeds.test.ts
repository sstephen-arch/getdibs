import { describe, expect, it } from "vitest";
import { buildJsonFeed, buildLlms, buildRss, buildSitemap, escapeXml } from "../../scripts/build-feeds";
import { TOPICS } from "@/content/schema";
import { entries, entry, project } from "../helpers/fixtures";

const NOW = new Date("2026-10-19T12:00:00Z");
const live = [entry({ kind: "essay", slug: "one", title: "One & Two", summary: "A <summary>", date: "2026-10-19" })];

describe("escapeXml", () => {
  it("escapes the five characters that break XML", () => {
    expect(escapeXml(`a & b < c > d " e ' f`)).toBe("a &amp; b &lt; c &gt; d &quot; e &apos; f");
  });
});

describe("buildRss", () => {
  it("is a well-formed channel with one item per entry", () => {
    const rss = buildRss(live, NOW);
    expect(rss.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(rss).toContain("<title>DIBS</title>");
    expect(rss.match(/<item>/g)).toHaveLength(1);
    expect(rss).toContain("<link>https://getdibs.io/essays/one/</link>");
    expect(rss).toContain("One &amp; Two");
    expect(rss).toContain("A &lt;summary&gt;");
  });

  it("carries a pubDate in RFC 822", () => {
    expect(buildRss(live, NOW)).toContain("<pubDate>Mon, 19 Oct 2026 12:00:00 GMT</pubDate>");
  });

  it("is empty but valid with no entries", () => {
    const rss = buildRss([], NOW);
    expect(rss).toContain("<channel>");
    expect(rss).not.toContain("<item>");
  });
});

describe("buildJsonFeed", () => {
  it("names the feed and every published item", () => {
    const feed = JSON.parse(buildJsonFeed(live, NOW));
    expect(feed.version).toBe("https://jsonfeed.org/version/1.1");
    expect(feed.items).toHaveLength(1);
    expect(feed.items[0].url).toBe("https://getdibs.io/essays/one/");
  });
});

describe("buildSitemap", () => {
  it("lists every surface, including item and topic routes", () => {
    const sitemap = buildSitemap([...live, ...entries(2)], [project({ slug: "manifest" })], TOPICS);
    for (const path of ["/", "/essays/", "/notes/", "/watch/", "/projects/", "/topics/", "/archive/",
                        "/about/", "/subscribe/", "/essays/one/", "/projects/manifest/", "/topics/local-ai/"]) {
      expect(sitemap).toContain(`<loc>https://getdibs.io${path}</loc>`);
    }
  });
});

describe("buildLlms", () => {
  it("lists the essays, notes and projects as text", () => {
    const llms = buildLlms(live, [project({ slug: "manifest", title: "Manifest" })], TOPICS);
    expect(llms).toContain("# DIBS");
    expect(llms).toContain("One & Two");
    expect(llms).toContain("Manifest");
  });
});
