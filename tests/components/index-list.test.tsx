// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { IndexList } from "@/components/IndexList";
import { entries } from "../helpers/fixtures";

const NOW = new Date("2026-10-19T12:00:00Z");

describe("IndexList", () => {
  it("uses full-width rows below three items", () => {
    const { container } = render(<IndexList title="Notes" items={entries(2)} emptyLabel="Nothing yet." now={NOW} />);
    expect(container.querySelector('[data-layout="rows"]')).toBeTruthy();
    expect(container.querySelector('[data-layout="grid"]')).toBeNull();
  });

  it("switches to a grid at three items", () => {
    const { container } = render(<IndexList title="Notes" items={entries(3)} emptyLabel="Nothing yet." now={NOW} />);
    expect(container.querySelector('[data-layout="grid"]')).toBeTruthy();
  });

  it("renders the empty label only when there is nothing", () => {
    const { container } = render(<IndexList title="Watch" items={[]} emptyLabel="Nothing yet." now={NOW} />);
    expect(container.textContent).toContain("Nothing yet.");
  });

  it("does not render the empty label when there are items", () => {
    const { container } = render(<IndexList title="Notes" items={entries(1)} emptyLabel="Nothing yet." now={NOW} />);
    expect(container.textContent).not.toContain("Nothing yet.");
  });
});
