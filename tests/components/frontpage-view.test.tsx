// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { FrontPageView } from "@/components/FrontPageView";
import { assembleFrontPage } from "@/content/frontpage";
import { TOPICS } from "@/content/schema";
import { entries, entry, project } from "../helpers/fixtures";

const NOW = new Date("2026-10-19T12:00:00Z");

function view(n: number, extra: Parameters<typeof assembleFrontPage>[0] = [], projects: Parameters<typeof assembleFrontPage>[1] = []) {
  const page = assembleFrontPage([...entries(n), ...extra], projects, TOPICS);
  return render(<FrontPageView page={page} now={NOW} />);
}

describe("FrontPageView", () => {
  it("renders a lead and no feed at three items", () => {
    const { container } = view(3);
    expect(container.querySelector('[data-band="lead"]')).toBeTruthy();
    expect(container.querySelector('[data-band="bunks"]')).toBeTruthy();
    expect(container.querySelector('[data-band="feed"]')).toBeNull();
  });

  it("renders the feed without a rail at thirty items, since there is no cross-section content", () => {
    const { container } = view(30);
    const feed = container.querySelector('[data-band="feed"]');
    expect(feed).toBeTruthy();
    expect(container.querySelector('[data-band="rail"]')).toBeNull();
    expect(container.querySelector("aside")).toBeNull();
    expect(container.textContent).not.toContain("Sections");
    // No empty 18rem column: the feed takes the full width when the rail is absent.
    expect(feed?.className).not.toContain("18rem");
  });

  it("never renders a side rail of links, and never repeats the lead in another band", () => {
    const vids = [1, 2, 3, 4].map((n) =>
      entry({ kind: "video", slug: `v${n}`, date: `2026-10-0${n}` }),
    );
    // Newest item overall, so the video is the lead; the Watch band must surface
    // the other videos without listing the lead again.
    const leadVideo = entry({ kind: "video", slug: "v-lead", date: "2026-10-20" });
    const { container } = view(4, [...vids, leadVideo], [project({ slug: "a" }), project({ slug: "b" })]);

    expect(container.querySelector('[data-band="rail"]')).toBeNull();
    expect(container.querySelector("aside")).toBeNull();

    const leadHref = container.querySelector('[data-band="lead"] a')?.getAttribute("href");
    expect(leadHref).toBe("/watch/v-lead/");
    const watchHrefs = [...container.querySelectorAll('[data-band="watch"] a')].map((link) => link.getAttribute("href"));
    expect(watchHrefs.length).toBeGreaterThan(0);
    expect(watchHrefs).not.toContain(leadHref);
  });

  it.each([
    { n: 1, bands: ["lead"] },
    { n: 2, bands: ["feed", "lead"] },
    { n: 5, bands: ["bunks", "feed", "lead"] },
  ])("renders only the bands it can honestly fill at $n items", ({ n, bands }) => {
    const { container } = view(n);
    const rendered = [...container.querySelectorAll("[data-band]")]
      .map((band) => band.getAttribute("data-band"))
      .sort();
    expect(rendered).toEqual(bands);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
  });

  it("renders no watch band below three videos", () => {
    const vids = [1, 2].map((n) => entry({ kind: "video", slug: `v${n}`, date: `2026-10-0${n}` }));
    const { container } = view(4, vids);
    expect(container.querySelector('[data-band="watch"]')).toBeNull();
  });

  it("renders the watch band at three videos", () => {
    const vids = [1, 2, 3].map((n) => entry({ kind: "video", slug: `v${n}`, date: `2026-10-0${n}` }));
    const { container } = view(4, vids);
    expect(container.querySelector('[data-band="watch"]')).toBeTruthy();
  });

  it("renders no projects band with one project", () => {
    const { container } = view(4, [], [project()]);
    expect(container.querySelector('[data-band="projects"]')).toBeNull();
  });

  it("renders the projects band with two", () => {
    const { container } = view(4, [], [project({ slug: "a" }), project({ slug: "b" })]);
    expect(container.querySelector('[data-band="projects"]')).toBeTruthy();
  });

  it("renders a quiet empty state rather than a broken page", () => {
    const { container } = render(
      <FrontPageView page={assembleFrontPage([], [], TOPICS)} now={NOW} />,
    );
    expect(container.querySelector('[data-band="lead"]')).toBeNull();
    expect(container.textContent).toContain("Nothing published yet");
  });
});
