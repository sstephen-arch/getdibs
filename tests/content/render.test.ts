import { describe, expect, it } from "vitest";
import { renderMarkdown } from "@/content/render";

describe("renderMarkdown", () => {
  it("renders paragraphs", async () => {
    expect(await renderMarkdown("Hello.")).toBe("<p>Hello.</p>");
  });

  it("renders GFM tables", async () => {
    const html = await renderMarkdown("| a | b |\n| - | - |\n| 1 | 2 |");
    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
  });

  it("gives headings stable ids", async () => {
    const html = await renderMarkdown("## On-device inference");
    expect(html).toContain('id="on-device-inference"');
  });

  it("renders fenced code", async () => {
    const html = await renderMarkdown("```ts\nconst x = 1;\n```");
    expect(html).toContain("<pre>");
    expect(html).toContain("const x = 1;");
  });
});
