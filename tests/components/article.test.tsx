// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Article } from "@/components/Article";
import { VideoEmbed } from "@/components/VideoEmbed";
import { entry } from "../helpers/fixtures";

const NOW = new Date("2026-10-19T12:00:00Z");

describe("Article", () => {
  it("renders the title, byline and body html", () => {
    const { container } = render(
      <Article entry={entry({ kind: "essay", title: "On-device", slug: "x" })} html="<p>Body text.</p>" now={NOW} />,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("On-device");
    expect(container.querySelector("article")?.innerHTML).toContain("Body text.");
    expect(screen.getByText(/Shem Stephen/)).toBeTruthy();
  });

  it("uses the entry author as the byline when frontmatter names one", () => {
    render(
      <Article
        entry={entry({ kind: "essay", title: "On-device", slug: "authored", author: "A Guest" })}
        html=""
        now={NOW}
      />,
    );
    expect(screen.getByText(/A Guest/)).toBeTruthy();
  });

  it("links a link item out to its source", () => {
    render(
      <Article
        entry={entry({ kind: "link", title: "Worth reading", url: "https://x.test/a", source: "The Verge", slug: "l" })}
        html=""
        now={NOW}
      />,
    );
    const link = screen.getByRole("link", { name: /The Verge/ });
    expect(link.getAttribute("href")).toBe("https://x.test/a");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("renders a link's hostname alongside the named source", () => {
    render(
      <Article
        entry={entry({
          kind: "link",
          title: "Worth reading",
          url: "https://example.com/a",
          source: "The Verge",
          slug: "host",
        })}
        html=""
        now={NOW}
      />,
    );
    expect(screen.getByText(/example\.com/)).toBeTruthy();
  });

  it("embeds a video without autoplay", () => {
    const { container } = render(
      <Article
        entry={entry({ kind: "video", title: "A talk", video_id: "abc123", channel: "Some Channel", slug: "v" })}
        html=""
        now={NOW}
      />,
    );
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toBe("https://www.youtube-nocookie.com/embed/abc123");
    expect(iframe?.getAttribute("loading")).toBe("lazy");
    expect(iframe?.getAttribute("src")).not.toContain("autoplay");
  });

  it("renders a video entry's body text alongside the embed", () => {
    const { container } = render(
      <Article
        entry={entry({ kind: "video", title: "A talk", video_id: "abc123", channel: "Some Channel", slug: "vb" })}
        html="<p>Why this is worth watching.</p>"
        now={NOW}
      />,
    );
    expect(container.querySelector("article")?.innerHTML).toContain("Why this is worth watching.");
  });

  it("names the author in a byline line of its own, not in the record row", () => {
    const { container } = render(
      <Article entry={entry({ kind: "essay", title: "On-device", slug: "byline" })} html="" now={NOW} />,
    );
    const byline = [...container.querySelectorAll("p")].find((p) => p.textContent?.startsWith("By "));

    expect(byline?.textContent).toBe("By Shem Stephen");
    // The record row is 11px mono; the byline is UI type at body size, because a
    // byline nobody can read is not a byline.
    expect(byline?.className).toContain("font-ui");
    expect(byline?.className).toContain("text-sm");
  });

  it("labels the way out of a link item as the original", () => {
    render(
      <Article
        entry={entry({ kind: "link", title: "Worth reading", url: "https://x.test/a", source: "The Verge", slug: "lbl" })}
        html=""
        now={NOW}
      />,
    );
    expect(screen.getByRole("link", { name: /Read the original at The Verge/ })).toBeTruthy();
  });

  it("still labels the original when a link names no publication", () => {
    render(
      <Article
        entry={entry({ kind: "link", title: "Worth reading", url: "https://example.com/b", slug: "nosrc" })}
        html=""
        now={NOW}
      />,
    );
    expect(screen.getByRole("link", { name: /Read the original/ })).toBeTruthy();
  });
});

describe("Article stats", () => {
  it("prints each figure with its label, number first", () => {
    const { container } = render(
      <Article
        entry={entry({
          kind: "essay",
          title: "Tested",
          slug: "stats",
          stats: [
            { value: "12", label: "models tested" },
            { value: "2", label: "computers", detail: "a MacBook and a Mac Studio" },
          ],
        })}
        html=""
        now={NOW}
      />,
    );
    const items = [...container.querySelectorAll("dl > div")];
    expect(items).toHaveLength(2);
    expect(items[0].querySelector("dt")?.textContent).toBe("models tested");
    expect(items[0].querySelector("dd")?.textContent).toBe("12");
    expect(items[1].textContent).toContain("a MacBook and a Mac Studio");
    expect(screen.getByRole("region", { name: "By the numbers" })).toBeTruthy();
  });

  it("renders no strip when an item has no stats", () => {
    const { container } = render(
      <Article entry={entry({ kind: "essay", title: "Plain", slug: "nostats" })} html="" now={NOW} />,
    );
    expect(container.querySelector("dl")).toBeNull();
  });
});

describe("Article briefing", () => {
  const SECTIONS = '<h2 id="one">One</h2><p>a</p><h2 id="two">Two</h2><p>b</p><h2 id="three">Three</h2>';

  it("leads with the short version and drops the standfirst it replaces", () => {
    render(
      <Article
        entry={entry({ kind: "essay", title: "T", slug: "tldr", summary: "The standfirst.", takeaways: ["First point.", "Second point."] })}
        html=""
        now={NOW}
      />,
    );
    const box = screen.getByRole("region", { name: "The short version" });
    expect([...box.querySelectorAll("li")].map((li) => li.textContent)).toEqual(["First point.", "Second point."]);
    expect(screen.queryByText("The standfirst.")).toBeNull();
  });

  it("keeps the standfirst when there is no short version", () => {
    render(<Article entry={entry({ kind: "essay", title: "T", slug: "nos", summary: "The standfirst." })} html="" now={NOW} />);
    expect(screen.getByText("The standfirst.")).toBeTruthy();
    expect(screen.queryByRole("region", { name: "The short version" })).toBeNull();
  });

  it("shows read time, source count, fact-check date and audience as chips", () => {
    render(
      <Article
        entry={entry({ kind: "essay", title: "T", slug: "chips", checked: "2026-10-21", audience: "IT and security leads" })}
        html='<p><a href="https://a.test/1">a</a> <a href="https://b.test">b</a></p>'
        now={NOW}
      />,
    );
    const chips = [...screen.getByRole("list", { name: "About this piece" }).querySelectorAll("li")].map((li) => li.textContent);
    expect(chips).toEqual(["1 min read", "2 sources", "Fact-checked 21 October", "For IT and security leads"]);
  });

  it("says one source, and leaves the chip out when there are none", () => {
    const { rerender } = render(
      <Article entry={entry({ kind: "essay", title: "T", slug: "one" })} html='<a href="https://a.test">a</a>' now={NOW} />,
    );
    expect(screen.getByText("1 source")).toBeTruthy();
    rerender(<Article entry={entry({ kind: "essay", title: "T", slug: "none" })} html="<p>x</p>" now={NOW} />);
    expect(screen.queryByText(/sources?$/)).toBeNull();
  });

  it("turns the sections into jump links in one column, with no sidebar", () => {
    const { container } = render(<Article entry={entry({ kind: "essay", title: "T", slug: "jump" })} html={SECTIONS} now={NOW} />);
    const jump = screen.getByRole("navigation", { name: "Jump to a section" });
    expect([...jump.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual(["#one", "#two", "#three"]);
    expect(container.querySelector("aside nav")).toBeNull();
  });

  it("skips jump links when there is little to jump between", () => {
    render(<Article entry={entry({ kind: "essay", title: "T", slug: "few" })} html='<h2 id="one">One</h2>' now={NOW} />);
    expect(screen.queryByRole("navigation", { name: "Jump to a section" })).toBeNull();
  });
});

describe("VideoEmbed", () => {
  it("always offers a text link to the source", () => {
    render(<VideoEmbed id="abc123" title="A talk" channel="Some Channel" url="https://youtube.com/watch?v=abc123" />);
    expect(screen.getByRole("link", { name: /Watch on YouTube/ }).getAttribute("href"))
      .toBe("https://youtube.com/watch?v=abc123");
  });
});
