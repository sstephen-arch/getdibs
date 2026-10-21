import { describe, expect, it } from "vitest";
import { ROOT, readTokenScopes } from "../helpers/tokens";

/* The Bold palette (21 Oct 2026). If a value drifts, this test is the thing
   that notices. */
const EXPECTED = {
  [ROOT]: {
    background: "0 0% 100%",
    foreground: "0 0% 4%",
    card: "0 0% 100%",
    "card-foreground": "0 0% 4%",
    popover: "0 0% 100%",
    "popover-foreground": "0 0% 4%",
    primary: "230 100% 58%",
    "primary-foreground": "0 0% 100%",
    secondary: "230 40% 96%",
    "secondary-foreground": "0 0% 4%",
    muted: "230 30% 96%",
    "muted-foreground": "0 0% 34%",
    accent: "230 30% 96%",
    "accent-foreground": "0 0% 4%",
    destructive: "0 72% 51%",
    "destructive-foreground": "0 0% 98%",
    border: "0 0% 4%",
    input: "0 0% 4%",
    ring: "230 100% 58%",
    highlight: "50 100% 65%",
    live: "149 66% 30%",
    hairline: "0 0% 86%",
  },
} as const;

describe("ported tokens", () => {
  const scopes = readTokenScopes();

  for (const [selector, expected] of Object.entries(EXPECTED)) {
    describe(selector, () => {
      for (const [name, value] of Object.entries(expected)) {
        it(`${name} is ${value}`, () => {
          expect(scopes[selector]?.[name]).toBe(value);
        });
      }
    });
  }

  it("declares one stock and no dark scope", () => {
    expect(Object.keys(scopes)).toEqual([ROOT]);
  });

  it("does not port depalo's chart tokens", () => {
    const all = Object.values(scopes).flatMap(Object.keys);
    expect(all.filter((k) => k.startsWith("chart-"))).toEqual([]);
  });
});
