import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CSS_PATH = fileURLToPath(new URL("../../src/app/globals.css", import.meta.url));

/** Parses a `--name: H S% L%` block out of globals.css. The CSS file is the
 *  source of truth; the spec's token table is asserted against it, not duplicated. */
export function readTokens(): Record<string, string> {
  const css = readFileSync(CSS_PATH, "utf8");
  const block = css.match(/--tokens-start--([\s\S]*?)--tokens-end--/);
  if (!block) throw new Error("globals.css is missing the --tokens-start--/--tokens-end-- block");
  const out: Record<string, string> = {};
  for (const line of block[1].split("\n")) {
    const m = line.match(/^\s*--([a-z0-9-]+):\s*([^;]+);/);
    if (m) out[m[1]] = m[2].trim();
  }
  if (Object.keys(out).length === 0) throw new Error("token block parsed but contained no tokens");
  return out;
}
