import { existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadContent, loadEntries, loadProjects } from "@/content/load";

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "getdibs-"));
  mkdirSync(join(root, "entries"), { recursive: true });
  mkdirSync(join(root, "projects"), { recursive: true });
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

const write = (rel: string, body: string) => writeFileSync(join(root, rel), body);

/** Two names that differ only by case are the same file on a case-insensitive
 *  volume (macOS APFS by default), so the duplicate-slug rule cannot be
 *  exercised with real files there. It still runs on case-sensitive CI. */
const CASE_INSENSITIVE = (() => {
  const dir = mkdtempSync(join(tmpdir(), "getdibs-case-"));
  writeFileSync(join(dir, "probe"), "");
  const insensitive = existsSync(join(dir, "PROBE"));
  rmSync(dir, { recursive: true, force: true });
  return insensitive;
})();

describe("loadEntries", () => {
  it("reads, validates and derives an essay", () => {
    write("entries/2026-10-19-hello.md", [
      "---", "kind: essay", "title: Hello", "summary: A summary.", "---", "", "Body.", "",
    ].join("\n"));

    const [entry] = loadEntries(join(root, "entries"));
    expect(entry.slug).toBe("hello");
    expect(entry.date).toBe("2026-10-19");
    expect(entry.title).toBe("Hello");
    expect(entry.titleDerived).toBe(false);
    expect(entry.body.trim()).toBe("Body.");
  });

  it("derives a title for a note with none", () => {
    write("entries/2026-10-19-quick.md", [
      "---", "kind: note", "summary: s", "---", "", "First sentence. Second one.", "",
    ].join("\n"));

    const [entry] = loadEntries(join(root, "entries"));
    expect(entry.title).toBe("First sentence.");
    expect(entry.titleDerived).toBe(true);
  });

  it("drops drafts but still validates them", () => {
    write("entries/2026-10-19-a.md", "---\nkind: essay\ntitle: A\nsummary: s\ndraft: true\n---\n\nx\n");
    expect(loadEntries(join(root, "entries"))).toHaveLength(0);
  });

  it("fails the load with the file name when frontmatter is invalid", () => {
    write("entries/2026-10-19-bad.md", "---\nkind: video\ntitle: B\nsummary: s\nvideo_id: abc123\n---\n\nx\n");
    expect(() => loadEntries(join(root, "entries"))).toThrow(/2026-10-19-bad\.md: kind "video" requires "channel"/);
  });

  it("fails on a filename with no date prefix", () => {
    write("entries/loose.md", "---\nkind: note\nsummary: s\n---\n\nx\n");
    expect(() => loadEntries(join(root, "entries"))).toThrow(/needs a YYYY-MM-DD filename prefix/);
  });

  it("returns newest first", () => {
    write("entries/2026-01-01-a.md", "---\nkind: note\nsummary: s\n---\n\nx\n");
    write("entries/2026-02-01-b.md", "---\nkind: note\nsummary: s\n---\n\nx\n");
    expect(loadEntries(join(root, "entries")).map((e) => e.slug)).toEqual(["b", "a"]);
  });
});

describe("loadContent", () => {
  it("rejects an entry pointing at a project that does not exist", () => {
    write("entries/2026-10-19-a.md", "---\nkind: essay\ntitle: A\nsummary: s\nproject: ghost\n---\n\nx\n");
    expect(() => loadContent(root)).toThrow(/2026-10-19-a\.md: project "ghost" does not exist/);
  });

  it("accepts an entry pointing at a real project", () => {
    write("projects/manifest.md", "---\ntitle: Manifest\nsummary: s\nstatus: shipped\nyear: \"2026\"\n---\n\nx\n");
    write("entries/2026-10-19-a.md", "---\nkind: essay\ntitle: A\nsummary: s\nproject: manifest\n---\n\nx\n");
    const { entries, projects } = loadContent(root);
    expect(entries[0].project).toBe("manifest");
    expect(projects[0].slug).toBe("manifest");
  });

  it.skipIf(CASE_INSENSITIVE)("fails on two projects with the same slug", () => {
    write("projects/manifest.md", "---\ntitle: A\nsummary: s\nstatus: shipped\nyear: \"2026\"\n---\n\nx\n");
    write("projects/MANIFEST.md", "---\ntitle: B\nsummary: s\nstatus: shipped\nyear: \"2026\"\n---\n\nx\n");
    expect(() => loadProjects(join(root, "projects"))).toThrow(/duplicate project slug "manifest"/);
  });
});
