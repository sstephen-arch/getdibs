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

  it("renders GFM strikethrough", async () => {
    const html = await renderMarkdown("~~gone~~");
    expect(html).toContain("<del>gone</del>");
  });

  it("autolinks bare URLs", async () => {
    const html = await renderMarkdown("https://example.com");
    expect(html).toContain('<a href="https://example.com">');
  });

  // Dropping raw HTML rather than passing it through is what keeps Prose's
  // dangerouslySetInnerHTML safe; nothing else sanitizes the rendered output.
  it("drops raw HTML instead of passing it through", async () => {
    const html = await renderMarkdown("<script>alert(1)</script>");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
  });

  it("does not render benign inline HTML as an element", async () => {
    const html = await renderMarkdown("Hello <b>bold</b>.");
    expect(html).not.toContain("<b>");
    expect(html).toBe("<p>Hello bold.</p>");
  });

  it("escapes text that looks like markup", async () => {
    const html = await renderMarkdown("5 < 6 & 7 > 3");
    expect(html).not.toContain("<6");
    expect(html).toMatch(/&(lt|#x3C);/);
    expect(html).toMatch(/&(amp|#x26);/);
  });
});
