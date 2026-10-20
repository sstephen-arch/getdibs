// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/Card";
import { Plate, topicColour } from "@/components/Plate";
import { entry } from "../helpers/fixtures";

const NOW = new Date("2026-10-19T12:00:00Z");

describe("Plate", () => {
  it("opens the item's own source file at its frontmatter", () => {
    const { container } = render(
      <Plate
        entry={entry({
          slug: "x",
          kind: "essay",
          date: "2026-10-19",
          title: "On-device inference",
          topics: ["local-ai"],
          file: "content/entries/2026-10-19-x.md",
        })}
      />,
    );
    const plate = container.querySelector("[data-plate]");
    expect(plate).toBeTruthy();
    expect(container.querySelector("img")).toBeNull();
    expect(plate?.textContent).toContain("content/entries/2026-10-19-x.md");
    expect(plate?.textContent).toContain("kind: essay");
    expect(plate?.textContent).toContain("date: 2026-10-19");
    expect(plate?.textContent).toContain("topics: [local-ai]");
  });

  it("states the reading time as a comment, since it is derived rather than written", () => {
    const { container } = render(<Plate entry={entry({ kind: "video", title: "A talk", body: "word ".repeat(460) })} />);
    expect(container.textContent).toContain("# 2 min read");
  });

  it("does not repeat the headline it sits next to", () => {
    const { container } = render(<Plate entry={entry({ title: "On-device inference" })} />);
    expect(container.textContent).not.toContain("On-device inference");
  });
});

describe("topicColour", () => {
  it("returns a colour, not the bare token triple stored in globals.css", () => {
    expect(topicColour("local-ai")).toBe("hsl(var(--highlight))");
    expect(topicColour("an-unmapped-topic")).toBe("hsl(var(--primary))");
    expect(topicColour()).toBe("hsl(var(--primary))");
  });

  it("always wraps its token in hsl()", () => {
    for (const colour of [topicColour("local-ai"), topicColour("other"), topicColour()]) {
      expect(colour).toMatch(/^hsl\(var\(--(highlight|primary)\)\)$/);
      expect(colour).not.toMatch(/^\d+\s+\d+%\s+\d+%$/);
    }
  });
});

describe("Card", () => {
  it("shows a cover when one exists", () => {
    const { container } = render(
      <Card entry={entry({ slug: "x", cover: "/c.webp", title: "Covered" })} now={NOW} />,
    );
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/c.webp");
  });

  it("renders text only when there is no cover, never an empty media box", () => {
    const { container } = render(<Card entry={entry({ slug: "y", title: "Uncovered", summary: "What it says." })} now={NOW} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[data-plate]")).toBeNull();
    expect(screen.getByText("What it says.")).toBeTruthy();
  });

  it("lists topics as plain text, so the title stays the card's only link", () => {
    const { container } = render(
      <Card entry={entry({ slug: "t", title: "Tagged", topics: ["local-ai"] })} now={NOW} />,
    );
    expect(container.textContent).toContain("#local-ai");
    expect(container.querySelectorAll("a")).toHaveLength(1);
  });

  it("links to the item and shows a relative timestamp inside 48 hours", () => {
    const { container } = render(
      <Card entry={entry({ slug: "recent", kind: "note", date: "2026-10-19", title: "T" })} now={NOW} />,
    );
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/notes/recent/");
    expect(screen.getByText("12 hours ago")).toBeTruthy();
  });

  it("links a video card to watch and an essay to essays", () => {
    const { container: video } = render(
      <Card entry={entry({ slug: "v", kind: "video", title: "V" })} now={NOW} />,
    );
    const { container: essay } = render(
      <Card entry={entry({ slug: "e", kind: "essay", title: "E" })} now={NOW} />,
    );
    expect(video.querySelector("a")?.getAttribute("href")).toBe("/watch/v/");
    expect(essay.querySelector("a")?.getAttribute("href")).toBe("/essays/e/");
  });

  it("makes the whole card one link named by the title", () => {
    const { container } = render(
      <Card entry={entry({ slug: "one", kind: "note", title: "One target" })} now={NOW} />,
    );
    const anchors = container.querySelectorAll("a");

    expect(anchors).toHaveLength(1);
    expect(anchors[0].getAttribute("href")).toBe("/notes/one/");
    expect(anchors[0].textContent).toBe("One target");
    expect(screen.getByRole("link", { name: "One target" })).toBe(anchors[0]);
    expect(container.querySelectorAll("a a")).toHaveLength(0);

    // The anchor's own box is only the title; the pseudo-element stretches its
    // hit area over the relatively-positioned article, including the media.
    expect(container.querySelector("article")?.classList.contains("relative")).toBe(true);
    expect(anchors[0].classList.contains("after:absolute")).toBe(true);
    expect(anchors[0].classList.contains("after:inset-0")).toBe(true);
  });
});
