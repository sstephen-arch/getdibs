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

  it("renders the feed and rail at thirty items", () => {
    const { container } = view(30);
    expect(container.querySelector('[data-band="feed"]')).toBeTruthy();
    expect(container.querySelector('[data-band="rail"]')).toBeTruthy();
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
