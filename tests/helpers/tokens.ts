import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CSS_PATH = fileURLToPath(new URL("../../src/app/globals.css", import.meta.url));

/** Parses the `--tokens-start--` … `--tokens-end--` region of globals.css into
 *  { selector: { token: value } }. globals.css is the source of truth; the spec's
 *  token table is asserted against it rather than copied into a second place. */
export function readTokenScopes(): Record<string, Record<string, string>> {
  const css = readFileSync(CSS_PATH, "utf8");
  const region = css.match(/--tokens-start--([\s\S]*?)--tokens-end--/);
  if (!region) throw new Error("globals.css is missing the --tokens-start--/--tokens-end-- block");

  /* The markers are comments, so the captured region begins with the closing
     comment delimiter and may contain other comments. Strip them so selector
     keys are exact. */
  const body = region[1]
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\*\/\s*/, "");

  const scopes: Record<string, Record<string, string>> = {};
  for (const block of body.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = block[1].trim().replace(/\s+/g, " ");
    const tokens: Record<string, string> = {};
    for (const decl of block[2].matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
      tokens[decl[1]] = decl[2].trim();
    }
    if (Object.keys(tokens).length > 0) scopes[selector] = tokens;
  }
  if (Object.keys(scopes).length === 0) throw new Error("token region parsed but held no declarations");
  return scopes;
}

export const WIRE = '[data-stock="wire"]';
export const READING = '[data-stock="reading"]';
