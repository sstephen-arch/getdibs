// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/Card";
import { Plate, topicColour } from "@/components/Plate";
import { entry } from "../helpers/fixtures";

const NOW = new Date("2026-10-19T12:00:00Z");

describe("Plate", () => {
  it("renders a typographic plate when there is no cover", () => {
    const { container } = render(
      <Plate entry={entry({ slug: "x", title: "On-device inference", topics: ["local-ai"] })} />,
    );
    expect(screen.getByText("On-device inference")).toBeTruthy();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[data-plate]")).toBeTruthy();
  });

  it("labels the kind", () => {
    render(<Plate entry={entry({ kind: "video", title: "A talk" })} />);
    expect(screen.getByText(/Video/)).toBeTruthy();
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

  it("falls back to the plate when there is no cover", () => {
    const { container } = render(<Card entry={entry({ slug: "y", title: "Uncovered" })} now={NOW} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[data-plate]")).toBeTruthy();
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
