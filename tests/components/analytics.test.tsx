// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Analytics } from "@/components/Analytics";

afterEach(() => {
  delete process.env.NEXT_PUBLIC_CF_BEACON;
});

describe("Analytics", () => {
  it("renders nothing when no beacon token is configured", () => {
    const { container } = render(<Analytics />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the Cloudflare beacon when configured", () => {
    process.env.NEXT_PUBLIC_CF_BEACON = "abc";
    const { container } = render(<Analytics />);
    expect(container.querySelector("script")?.getAttribute("data-cf-beacon")).toContain("abc");
  });
});
