import { describe, expect, it } from "vitest";
import { readTokens } from "./helpers/tokens";

describe("scaffold", () => {
  it("exposes the ported token block", () => {
    expect(readTokens()["background"]).toBeDefined();
  });
});
