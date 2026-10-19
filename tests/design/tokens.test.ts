import { describe, expect, it } from "vitest";
import { READING, WIRE, readTokenScopes } from "../helpers/tokens";

/* Copied verbatim from spec §7.2. If a value drifts from depaloconsultingllc.com,
   this test is the thing that notices. */
const EXPECTED = {
  [READING]: {
    background: "36 33% 97%",
    foreground: "40 6% 10%",
    card: "0 0% 100%",
    "card-foreground": "40 6% 10%",
    popover: "0 0% 100%",
    "popover-foreground": "40 6% 10%",
    primary: "224 75% 48%",
    "primary-foreground": "0 0% 100%",
    secondary: "40 24% 93%",
    "secondary-foreground": "40 6% 10%",
    muted: "40 24% 93%",
    "muted-foreground": "38 5% 40%",
    accent: "40 24% 93%",
    "accent-foreground": "40 6% 10%",
    destructive: "0 72% 51%",
    "destructive-foreground": "0 0% 98%",
    border: "37 21% 88%",
    input: "37 21% 88%",
    ring: "224 75% 48%",
    highlight: "32 95% 44%",
    live: "149 66% 30%",
  },
  [WIRE]: {
    background: "40 7% 8%",
    foreground: "40 27% 93%",
    card: "30 7% 11%",
    "card-foreground": "40 27% 93%",
    popover: "30 7% 11%",
    "popover-foreground": "40 27% 93%",
    primary: "226 82% 72%",
    "primary-foreground": "222 55% 13%",
    secondary: "34 8% 17%",
    "secondary-foreground": "40 27% 93%",
    muted: "34 8% 17%",
    "muted-foreground": "39 7% 61%",
    accent: "34 8% 17%",
    "accent-foreground": "40 27% 93%",
    destructive: "0 72% 60%",
    "destructive-foreground": "0 0% 98%",
    border: "34 8% 17%",
    input: "34 8% 17%",
    ring: "226 82% 72%",
    highlight: "38 92% 58%",
    live: "149 49% 49%",
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

  it("does not port depalo's chart tokens", () => {
    const all = Object.values(scopes).flatMap(Object.keys);
    expect(all.filter((k) => k.startsWith("chart-"))).toEqual([]);
  });
});
