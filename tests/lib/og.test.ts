import { describe, expect, it } from "vitest";
import { itemMetadata } from "@/lib/og";
import { entry } from "../helpers/fixtures";

describe("itemMetadata", () => {
  it("builds title, description and canonical url", () => {
    const meta = itemMetadata(entry({ kind: "essay", slug: "one", title: "One", summary: "S" }));
    expect(meta.title).toBe("One");
    expect(meta.description).toBe("S");
    expect(meta.alternates?.canonical).toBe("https://getdibs.io/essays/one/");
  });

  it("uses the cover as the preview image when there is one", () => {
    const meta = itemMetadata(entry({ slug: "x", cover: "/c.webp" }));
    expect((meta.openGraph as { images?: { url: string }[] }).images?.[0].url).toBe("/c.webp");
  });

  it("omits the image when there is no cover, rather than inventing one", () => {
    const meta = itemMetadata(entry({ slug: "y" }));
    expect((meta.openGraph as { images?: unknown }).images).toBeUndefined();
  });

  it("marks a link item's type as article and sets the published time", () => {
    const meta = itemMetadata(entry({ kind: "link", slug: "l", date: "2026-10-19" }));
    expect((meta.openGraph as { type?: string }).type).toBe("article");
    expect((meta.openGraph as { publishedTime?: string }).publishedTime).toBe("2026-10-19");
  });
});
