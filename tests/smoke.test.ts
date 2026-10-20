import { describe, expect, it } from "vitest";
import { readTokenScopes } from "./helpers/tokens";

describe("scaffold", () => {
  it("exposes the single paper stock in the token region", () => {
    const scopes = readTokenScopes();
    expect(Object.keys(scopes)).toHaveLength(1);
  });
});
