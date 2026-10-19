// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/Card";
import { Plate } from "@/components/Plate";
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
});
