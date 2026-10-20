import { describe, expect, it } from "vitest";
import { entryPath, projectPath } from "@/content/routes";
import { entry, project } from "../helpers/fixtures";

describe("routes", () => {
  it("maps each kind to its section", () => {
    expect(entryPath(entry({ kind: "essay", slug: "a" }))).toBe("/essays/a/");
    expect(entryPath(entry({ kind: "note", slug: "b" }))).toBe("/notes/b/");
    expect(entryPath(entry({ kind: "link", slug: "c" }))).toBe("/notes/c/");
    expect(entryPath(entry({ kind: "video", slug: "d" }))).toBe("/watch/d/");
  });

  it("maps a project", () => {
    expect(projectPath(project({ slug: "manifest" }))).toBe("/projects/manifest/");
  });
});
