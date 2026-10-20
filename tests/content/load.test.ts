import { existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadContent, loadEntries, loadProjects } from "@/content/load";
import { ContentError } from "@/content/validate";

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

  it("fails on an invalid draft instead of silently dropping it", () => {
    write(
      "entries/2026-10-19-bad-draft.md",
      "---\nkind: video\ntitle: B\nsummary: s\nvideo_id: abc123\ndraft: true\n---\n\nx\n",
    );
    expect(() => loadEntries(join(root, "entries"))).toThrow(
      /2026-10-19-bad-draft\.md: kind "video" requires "channel"/,
    );
  });

  it("fails the load with the file name when frontmatter is invalid", () => {
    write("entries/2026-10-19-bad.md", "---\nkind: video\ntitle: B\nsummary: s\nvideo_id: abc123\n---\n\nx\n");
    expect(() => loadEntries(join(root, "entries"))).toThrow(/2026-10-19-bad\.md: kind "video" requires "channel"/);
  });

  it("fails on a filename with no date prefix", () => {
    write("entries/loose.md", "---\nkind: note\nsummary: s\n---\n\nx\n");
    expect(() => loadEntries(join(root, "entries"))).toThrow(/needs a YYYY-MM-DD filename prefix/);
  });

  it("names the file when YAML frontmatter is malformed", () => {
    const file = join(root, "entries/2026-10-19-broken.md");
    write("entries/2026-10-19-broken.md", "---\ntitle: [unclosed\n---\n\nx\n");

    let thrown: unknown;
    try {
      loadEntries(join(root, "entries"));
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ContentError);
    expect((thrown as Error).message.startsWith(`${file}: `)).toBe(true);
    // The parser's own diagnosis must survive, not just any "file: ..." prefix.
    expect((thrown as Error).message).toMatch(/flow collection/);
  });

  it("names the file when it cannot be read", () => {
    const file = join(root, "entries/2026-01-01-dir.md");
    mkdirSync(file);

    let thrown: unknown;
    try {
      loadEntries(join(root, "entries"));
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ContentError);
    expect((thrown as Error).message.startsWith(`${file}: `)).toBe(true);
    expect((thrown as Error).message).toMatch(/EISDIR/);
  });

  it("fails on two entries with the same slug", () => {
    write("entries/2026-01-01-dup.md", "---\nkind: note\nsummary: s\n---\n\nx\n");
    write("entries/2026-02-01-dup.md", "---\nkind: note\nsummary: s\n---\n\nx\n");
    expect(() => loadEntries(join(root, "entries"))).toThrow(
      /2026-02-01-dup\.md: duplicate entry slug "dup"/,
    );
  });

  it("fails on two entries whose slugs collide only by case", () => {
    write("entries/2026-01-01-Hello.md", "---\nkind: note\nsummary: s\n---\n\nx\n");
    write("entries/2026-02-01-hello.md", "---\nkind: note\nsummary: s\n---\n\nx\n");
    expect(() => loadEntries(join(root, "entries"))).toThrow(
      /2026-02-01-hello\.md: duplicate entry slug "hello"/,
    );
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

  it("treats a missing projects directory as no projects", () => {
    write("entries/2026-10-19-a.md", "---\nkind: note\nsummary: s\n---\n\nx\n");
    rmSync(join(root, "projects"), { recursive: true, force: true });

    const { entries, projects } = loadContent(root);
    expect(entries.map((entry) => entry.slug)).toEqual(["a"]);
    expect(projects).toEqual([]);
  });

  it("still fails when the projects path is a file, not a directory", () => {
    write("entries/2026-10-19-a.md", "---\nkind: note\nsummary: s\n---\n\nx\n");
    const projects = join(root, "projects");
    rmSync(projects, { recursive: true, force: true });
    writeFileSync(projects, "not a directory");

    let thrown: unknown;
    try {
      loadContent(root);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ContentError);
    expect((thrown as Error).message.startsWith(`${projects}: `)).toBe(true);
    expect((thrown as Error).message).toMatch(/ENOTDIR/);
  });

  it.skipIf(CASE_INSENSITIVE)("fails on two projects with the same slug", () => {
    write("projects/manifest.md", "---\ntitle: A\nsummary: s\nstatus: shipped\nyear: \"2026\"\n---\n\nx\n");
    write("projects/MANIFEST.md", "---\ntitle: B\nsummary: s\nstatus: shipped\nyear: \"2026\"\n---\n\nx\n");
    expect(() => loadProjects(join(root, "projects"))).toThrow(/duplicate project slug "manifest"/);
  });

  it("pins featured projects above the rest, then sorts by year and slug", () => {
    const project = (name: string, extra: string) =>
      write(`projects/${name}.md`, `---\ntitle: ${name}\nsummary: s\nstatus: shipped\nyear: "2026"\n${extra}---\n\nx\n`);

    project("zulu", "featured: true\n");
    project("alpha", "");
    project("bravo", "featured: true\n");

    expect(loadProjects(join(root, "projects")).map((p) => p.slug)).toEqual([
      "bravo",
      "zulu",
      "alpha",
    ]);
  });

  it("rejects a non-boolean featured flag", () => {
    write("projects/manifest.md", "---\ntitle: A\nsummary: s\nstatus: shipped\nyear: \"2026\"\nfeatured: yes\n---\n\nx\n");
    expect(() => loadProjects(join(root, "projects"))).toThrow(/featured must be true or false/);
  });
});
