// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/Card";
import { Plate, topicColour } from "@/components/Plate";
import { entry } from "../helpers/fixtures";

const NOW = new Date("2026-10-19T12:00:00Z");

describe("Plate", () => {
  it("fills the image slot with the topic colour and no text", () => {
    const { container } = render(
      <Plate entry={entry({ slug: "x", title: "On-device inference", topics: ["local-ai"] })} />,
    );
    const plate = container.querySelector<HTMLElement>("[data-plate]");
    expect(plate).toBeTruthy();
    expect(plate?.textContent).toBe("");
    expect(plate?.style.backgroundColor).toBe("hsl(var(--highlight))");
    expect(container.querySelector("img")).toBeNull();
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

  it("falls back to the topic-colour plate when there is no cover", () => {
    const { container } = render(<Card entry={entry({ slug: "y", title: "Uncovered", summary: "What it says." })} now={NOW} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[data-plate]")).toBeTruthy();
    expect(screen.getByText("What it says.")).toBeTruthy();
  });

  it("sets the kicker from the topic, and says when an item points at someone else's work", () => {
    const { container: essay } = render(
      <Card entry={entry({ slug: "k1", kind: "essay", title: "K", topics: ["local-ai"] })} now={NOW} />,
    );
    const { container: link } = render(
      <Card entry={entry({ slug: "k2", kind: "link", title: "L", topics: ["local-ai"] })} now={NOW} />,
    );
    expect(essay.textContent).toContain("Local AI");
    expect(link.textContent).toContain("Worth reading");
  });

  it("styles nothing as a hyperlink: no arrows, no link colour on the headline", () => {
    const { container } = render(
      <Card entry={entry({ slug: "t", title: "Tagged", topics: ["local-ai"] })} now={NOW} />,
    );
    expect(container.textContent).not.toMatch(/[→↗]/);
    expect(container.querySelectorAll("a")).toHaveLength(1);
    const classes = [...(container.querySelector("a")?.classList ?? [])];
    expect(classes).not.toContain("underline");
    expect(classes.some((c) => c.includes("text-primary"))).toBe(false);
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
