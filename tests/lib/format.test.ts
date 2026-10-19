import { describe, expect, it } from "vitest";
import { formatWhen } from "@/lib/format";

const NOW = new Date("2026-10-19T12:00:00Z");

describe("formatWhen", () => {
  it("says just now under a minute", () => {
    expect(formatWhen("2026-10-19T11:59:30Z", NOW)).toBe("just now");
  });

  it("uses minutes under an hour", () => {
    expect(formatWhen("2026-10-19T11:58:00Z", NOW)).toBe("2 minutes ago");
    expect(formatWhen("2026-10-19T11:59:00Z", NOW)).toBe("1 minute ago");
  });

  it("uses hours under a day", () => {
    expect(formatWhen("2026-10-19T09:00:00Z", NOW)).toBe("3 hours ago");
    expect(formatWhen("2026-10-19T11:00:00Z", NOW)).toBe("1 hour ago");
  });

  it("says yesterday between 24 and 48 hours", () => {
    expect(formatWhen("2026-10-18T08:00:00Z", NOW)).toBe("yesterday");
  });

  it("switches to an absolute date at 48 hours", () => {
    expect(formatWhen("2026-10-17T12:00:00Z", NOW)).toBe("17 October");
  });

  it("adds the year when it differs from now", () => {
    expect(formatWhen("2025-03-12T12:00:00Z", NOW)).toBe("12 March 2025");
  });
});
