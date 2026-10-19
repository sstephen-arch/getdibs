# getdibs.io Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a newsroom-shaped personal publication at getdibs.io: markdown in the repo, a self-assembling front page that never looks broken, and a publishing path fast enough to post several times a week.

**Architecture:** A fully static Next.js site. Markdown lives in `content/`, is validated and read at build time by a small content layer, and is rendered into static HTML in `out/`. There is no database, no API route, no session and no server runtime. A pure function assembles the front page from whatever content exists, applying per-band minimums so no band ever renders half-empty. Token pairs ported verbatim from depaloconsultingllc.com decide the surface: the *wire* (dark) for anything scanned in a list, the *reading* stock (light) for any single item opened.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Vitest 5, gray-matter + unified/remark for markdown, deployed to Cloudflare Pages via static export.

## Global Constraints

Every task's requirements implicitly include this section. Values are copied verbatim from the spec (`docs/superpowers/specs/2026-10-19-getdibs-design.md`).

- **Next.js `16.4.2`.** Do **not** install `15.3.3` — npm flags it deprecated with CVE-2025-66478. Pin the exact version.
- **React `19.3.1`**, **Tailwind CSS `4.3.3`**, **Vitest `5.0.5`**.
- **Node 22**.
- **`output: 'export'`.** Fully static. No route handlers, no `cookies()`, no `headers()`, no ISR, no middleware. Anything generated at build time is either a Next file convention that supports static export, or a file written into `public/` by a script.
- **`trailingSlash: true`** so exported routes are `<route>/index.html` and Cloudflare Pages serves them cleanly.
- **No `next/image`.** Static export requires `images.unoptimized: true`, which removes the benefit. Use plain `<img>` with explicit `width`/`height`.
- **Allowed runtime dependencies:** `next`, `react`, `react-dom`, `gray-matter`, `remark`, `remark-gfm`, `remark-rehype`, `rehype-slug`, `rehype-stringify`. Adding anything else requires a reason in the commit message.
- **Stock rule:** the wire (dark) for every index route; the reading stock (light) for every `[slug]` route plus `/about` and `/subscribe`. Applied by passing `stock` to `StockShell`. There is no per-page judgement and **no colour-scheme toggle**.
- **Token values** must match spec §7.2 character for character. `tests/helpers/tokens.ts` parses `src/app/globals.css` and asserts this; the CSS file is the single source of truth.
- **Type:** Source Serif 4 (display + body), Inter (UI), JetBrains Mono (records). No other families.
- **Band minimums:** lead 1, bunks 2, feed 1, watch 3, projects 2, topics 2. A band below its minimum does not render, and must not strand its items.
- **Drafts (`draft: true`) are excluded** from every route, feed, sitemap and OG image.
- **A note with no `title`** derives its headline from the first sentence of its body, truncated to 160 characters.
- **Timestamps:** relative below 48 hours (`3 hours ago`), absolute at or above (`12 March`, and `12 March 2025` if a different year).
- **Nothing renders an empty box, a placeholder, or a half-empty grid.** Ever.

### Spec amendments

Two deliberate deviations from the approved spec, both to reduce risk and dependencies. They are small and both are flagged here rather than applied silently.

1. **`.md`, not `.mdx`.** Markdown is compiled with `remark` + `remark-gfm`, not MDX. MDX would let arbitrary JSX into posts, which is genuinely useful for a builder's site — but it adds a compiler whose API must be verified for the installed version, and v1's only in-post embed (video) comes from frontmatter. The content layer is pure functions over strings, so adopting MDX later is a change to one module (`src/content/render.ts`), not a migration.
2. **RSS, sitemap, JSON feed and `llms.txt` are written by a build script into `public/`,** not by Next route handlers or `app/sitemap.ts`. Static export's support for dynamic route handlers is version-dependent; writing files cannot break. One mechanism for four outputs, fully testable.
3. **No build-time OG image generation in v1.** The spec listed it as the first thing to cut, and it is cut: rendering a plate to a PNG needs a font binary and a native rasteriser in the build, which is two dependencies and a build-time failure mode to buy a nicety. Items with a `cover` get a rich preview; items without one get a text-only preview, which is honest and costs nothing. The plate still renders in the page — it is only the *image file* that is dropped. Adopting it later changes `src/lib/og.ts` and adds two dependencies; nothing else moves.

## File Structure

| Path | Responsibility |
|---|---|
| `src/app/globals.css` | Tokens (the single source of truth) + `@theme inline` mapping + base styles |
| `src/app/layout.tsx` | `<html>`, the three fonts, metadata defaults |
| `src/app/*/page.tsx` | Routes. Each wraps its content in `<StockShell stock="…">` |
| `src/app/projects/[slug]/page.tsx`, etc. | Item pages, reading stock |
| `src/content/schema.ts` | `Entry`, `Project`, `Topic`, `Kind` types + `TOPICS` config |
| `src/content/validate.ts` | Frontmatter validation → readable, named errors |
| `src/content/load.ts` | Read `content/**`, validate, apply defaults, sort, drop drafts |
| `src/content/derive.ts` | `noteHeadline`, `entryDate`, `sortEntries`, `publishedOnly` |
| `src/content/render.ts` | Markdown → HTML string (the one module MDX would replace) |
| `src/content/frontpage.ts` | `assembleFrontPage(entries, projects, topics)` — pure |
| `src/lib/format.ts` | `formatWhen(date, now)` |
| `src/lib/site.ts` | `SITE` constants (name, url, author, tagline) |
| `src/components/` | `StockShell`, `Masthead`, `Footer`, `Card`, `Plate`, `KindTag`, `Lead`, `Bunk`, `Feed`, `Rail`, `Band`, `VideoEmbed`, `Prose`, `Timeline` |
| `scripts/new.ts` | `npm run new <essay\|note\|link\|video> …` |
| `scripts/build-feeds.ts` | Writes `public/{feed.xml,feed.json,llms.txt,sitemap.xml}` |
| `scripts/build-og.ts` | Renders plate → PNG into `public/og/` |
| `tests/**` | Vitest. `tests/helpers/` holds fixture builders and the token parser |
| `content/entries/*.md` | Entries |
| `content/projects/*.md` | Projects |

Files that change together live together: everything that knows the shape of an entry is under `src/content/`; everything that knows how one is displayed is under `src/components/`.

---

### Task 1: Scaffold, and verify the framework's real conventions

The old project's `AGENTS.md` warns that Next is not what an agent's training data assumes and instructs reading the shipped docs first. That warning is correct — the installed version is a major newer. This task's first job is to replace assumption with the actual documentation, then stand the app up.

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/lib/site.ts`, `tests/helpers/tokens.ts`, `tests/smoke.test.ts`
- Create: `public/robots.txt`

**Interfaces:**
- Consumes: nothing.
- Produces: `SITE` from `src/lib/site.ts`; the `@/*` path alias resolving to `./src/*`; the token parser `readTokens()` from `tests/helpers/tokens.ts`.

- [ ] **Step 1: Verify the installed framework's conventions before writing any routes**

Install first, then read what actually shipped:

```bash
npm init -y
npm i next@16.4.2 react@19.3.1 react-dom@19.3.1
npm i -D typescript@5 @types/node @types/react @types/react-dom tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3
npm i -D vitest@5.0.5 jsdom @vitejs/plugin-react @testing-library/react tsx
ls node_modules/next/dist/docs 2>/dev/null || echo "NO SHIPPED DOCS"
```

If `node_modules/next/dist/docs` exists, read its App Router and static-export guides. If it does not, fetch the official docs for **16.x** and confirm each of these four things before continuing:

1. The name and shape of the `output: 'export'` option in `next.config.ts`.
2. Whether `params` in a dynamic route's `page.tsx` is a Promise (it was, in 15) and therefore whether `generateStaticParams` output must be awaited at the call site.
3. Whether `export const metadata` and `generateMetadata` are unchanged.
4. Whether Tailwind 4 needs `@tailwindcss/postcss` wired into `postcss.config.mjs` and an `@import "tailwindcss";` in the root stylesheet.

Record what you found as a comment at the top of `next.config.ts`. If any answer contradicts code later in this plan, **the documentation wins** — say so in the task report and adjust, because this plan was written against docs that may not match the installed release.

- [ ] **Step 2: Write the config files**

`package.json` (scripts matter — later tasks add to them):

```json
{
  "name": "getdibs",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "tsx scripts/build-feeds.ts && next build",
    "test": "vitest run",
    "check": "tsx scripts/check.ts"
  }
}
```

Scripts run through `tsx`, not `node --experimental-strip-types`: Node's type stripping cannot resolve extensionless relative imports in ESM, and every script here imports from `src/`. `tsx` resolves them, and the alias too.

`next.config.ts`:

```ts
import type { NextConfig } from "next";

/* Written against the conventions verified in Task 1, Step 1. */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "out"]
}
```

`postcss.config.mjs`:

```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { environment: "node", globals: true },
});
```

`public/robots.txt` — constant, so it is a committed file rather than generated:

```
User-agent: *
Allow: /

Sitemap: https://getdibs.io/sitemap.xml
```

- [ ] **Step 3: Write the site constants**

`src/lib/site.ts`:

```ts
export const SITE = {
  name: "DIBS",
  domain: "getdibs.io",
  url: "https://getdibs.io",
  tagline: "Local AI, built things, and what's worth your time.",
  author: "Shem Stephen",
  description:
    "A personal publication about local AI, the things I build, and what's worth your time.",
} as const;
```

- [ ] **Step 4: Write the minimum app so the build has something to export**

`src/app/globals.css` (tokens land in Task 2; this is the Tailwind entry for now):

```css
@import "tailwindcss";

html { -webkit-text-size-adjust: 100%; }
body { margin: 0; }
```

`src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx`:

```tsx
export default function Page() {
  return <main>DIBS</main>;
}
```

- [ ] **Step 5: Write the failing token parser test**

`tests/helpers/tokens.ts`:

```ts
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
```

`tests/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { readTokens } from "./helpers/tokens";

describe("scaffold", () => {
  it("exposes the ported token block", () => {
    expect(readTokens()["background"]).toBeDefined();
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `globals.css is missing the --tokens-start--/--tokens-end-- block`.

- [ ] **Step 7: Add the token block markers so the parser has something real to read**

Task 2 fills in the values. For now, append to `src/app/globals.css`:

```css
/* --tokens-start-- */
:root {
  --background: 36 33% 97%;
}
/* --tokens-end-- */
```

- [ ] **Step 8: Run the tests, then the build**

Run: `npm test`
Expected: PASS, 1 test.

```bash
npm run build
test -f out/index.html && echo "STATIC EXPORT OK"
```

Expected: build succeeds, `STATIC EXPORT OK` prints. Do not commit if the export did not appear.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next 16, Tailwind 4, Vitest with static export"
```

---

### Task 2: Tokens, type, and the two stocks

The identity is not invented here — it is ported. `src/app/globals.css` becomes the single source of truth for the token values in spec §7.2, and every later contrast and correctness check parses that file rather than duplicating it.

**Files:**
- Modify: `src/app/globals.css` (replace the placeholder token region)
- Modify: `src/app/layout.tsx` (fonts, `data-stock="wire"` default on `<body>`)
- Create: `src/components/StockShell.tsx`, `src/components/Masthead.tsx`, `src/components/Footer.tsx`
- Modify: `tests/helpers/tokens.ts` (scoped parser), `tests/smoke.test.ts`
- Create: `tests/design/tokens.test.ts`

**Interfaces:**
- Consumes: `SITE` from Task 1.
- Produces: `readTokenScopes(): Record<string, Record<string, string>>` from `tests/helpers/tokens.ts`; `StockShell({ stock, children })` where `stock: "wire" | "reading"`; CSS custom properties `--font-display`, `--font-ui`, `--font-mono`.

- [ ] **Step 1: Write the failing token test**

The placeholder `readTokens()` from Task 1 collapses both stocks into one record. Replace it with a scoped parser and update the smoke test's target.

`tests/helpers/tokens.ts` (full file):

```ts
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

  const scopes: Record<string, Record<string, string>> = {};
  for (const block of region[1].matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
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
```

`tests/smoke.test.ts` (full file):

```ts
import { describe, expect, it } from "vitest";
import { readTokenScopes } from "./helpers/tokens";

describe("scaffold", () => {
  it("exposes both stocks in the token region", () => {
    const scopes = readTokenScopes();
    expect(Object.keys(scopes)).toHaveLength(2);
  });
});
```

`tests/design/tokens.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/design/tokens.test.ts`
Expected: FAIL — the region contains only `:root`, so both scope lookups are `undefined`.

- [ ] **Step 3: Write the tokens**

Replace the whole `--tokens-start--` … `--tokens-end--` region of `src/app/globals.css`, and pair it with the Tailwind mapping and the few base rules the stocks need.

```css
@import "tailwindcss";

/* --tokens-start-- */
/* Ported verbatim from depaloconsultingllc.com. Same names, same values, so a
   change on either site is a copy-paste. Depalo's --chart-1..6 are deliberately
   not ported: there are no charts here. */
[data-stock="reading"] {
  --background: 36 33% 97%;
  --foreground: 40 6% 10%;
  --card: 0 0% 100%;
  --card-foreground: 40 6% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 40 6% 10%;
  --primary: 224 75% 48%;
  --primary-foreground: 0 0% 100%;
  --secondary: 40 24% 93%;
  --secondary-foreground: 40 6% 10%;
  --muted: 40 24% 93%;
  --muted-foreground: 38 5% 40%;
  --accent: 40 24% 93%;
  --accent-foreground: 40 6% 10%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 98%;
  --border: 37 21% 88%;
  --input: 37 21% 88%;
  --ring: 224 75% 48%;
  --highlight: 32 95% 44%;
  --live: 149 66% 30%;
}

[data-stock="wire"] {
  --background: 40 7% 8%;
  --foreground: 40 27% 93%;
  --card: 30 7% 11%;
  --card-foreground: 40 27% 93%;
  --popover: 30 7% 11%;
  --popover-foreground: 40 27% 93%;
  --primary: 226 82% 72%;
  --primary-foreground: 222 55% 13%;
  --secondary: 34 8% 17%;
  --secondary-foreground: 40 27% 93%;
  --muted: 34 8% 17%;
  --muted-foreground: 39 7% 61%;
  --accent: 34 8% 17%;
  --accent-foreground: 40 27% 93%;
  --destructive: 0 72% 60%;
  --destructive-foreground: 0 0% 98%;
  --border: 34 8% 17%;
  --input: 34 8% 17%;
  --ring: 226 82% 72%;
  --highlight: 38 92% 58%;
  --live: 149 49% 49%;
}
/* --tokens-end-- */

/* `inline` is load-bearing, exactly as it is in the existing Starkive project: the
   generated utilities must carry the value, not a second level of var() indirection
   over a token that a nested stock scope re-declares. */
@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-border: hsl(var(--border));
  --color-ring: hsl(var(--ring));
  --color-highlight: hsl(var(--highlight));
  --color-live: hsl(var(--live));

  --font-display: var(--font-source-serif);
  --font-ui: var(--font-inter);
  --font-mono: var(--font-jetbrains);

  --radius-control: 0.5rem;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: var(--font-ui), ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Records read as records. Anything that is a date, a byline or a slug opts in. */
.record {
  font-family: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
  font-variant-numeric: tabular-nums;
}

/* The reading measure. Long-form only; the wire stays wide and dense. */
.measure {
  max-width: 68ch;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/design/tokens.test.ts tests/smoke.test.ts`
Expected: PASS — 44 token assertions plus the scope count.

- [ ] **Step 5: Load the three fonts and default the body to the wire**

`src/app/layout.tsx` (full file):

```tsx
import type { Metadata } from "next";
import { Source_Serif_4, Inter, JetBrains_Mono } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
});

const ui = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* Most routes are index routes, so the wire is the site default. `StockShell`
       re-declares the stock per page; tokens resolve from the nearest ancestor. */
    <html lang="en" className={`${serif.variable} ${ui.variable} ${mono.variable}`}>
      <body data-stock="wire">{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Write the stock shell, masthead and footer**

`src/components/StockShell.tsx`:

```tsx
import { Masthead } from "./Masthead";
import { Footer } from "./Footer";

/** THE RULE, in one component: the wire (dark) is for anything the reader scans
 *  in a list; the reading stock (light) is for any single item they have opened.
 *  There is no colour-scheme toggle, so this prop is the only way a stock changes. */
export function StockShell({
  stock,
  children,
}: {
  stock: "wire" | "reading";
  children: React.ReactNode;
}) {
  return (
    <div
      data-stock={stock}
      className="min-h-dvh bg-background text-foreground flex flex-col"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-4 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Masthead />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

`src/components/Masthead.tsx`:

```tsx
import Link from "next/link";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/essays/", label: "Essays" },
  { href: "/notes/", label: "Notes" },
  { href: "/watch/", label: "Watch" },
  { href: "/projects/", label: "Projects" },
  { href: "/topics/", label: "Topics" },
] as const;

export function Masthead() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-6 gap-y-2 px-5 py-4">
        <Link href="/" className="flex items-baseline gap-3 no-underline">
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            {SITE.name}
          </span>
          {/* The domain is part of the design, not something to work around. */}
          <span className="record text-xs text-muted-foreground">{SITE.domain}</span>
        </Link>
        <nav aria-label="Sections" className="ml-auto flex flex-wrap gap-x-5 gap-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-ui text-sm text-muted-foreground no-underline hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
```

`src/components/Footer.tsx`:

```tsx
import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-4 px-5 py-8 font-ui text-sm text-muted-foreground">
        <p className="m-0">
          {SITE.tagline}
        </p>
        <nav aria-label="Elsewhere" className="flex gap-5">
          <Link href="/about/" className="no-underline hover:text-foreground">About</Link>
          <Link href="/subscribe/" className="no-underline hover:text-foreground">Subscribe</Link>
          <a href="/feed.xml" className="no-underline hover:text-foreground">RSS</a>
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: Prove both stocks render, then commit**

`src/app/page.tsx` (temporary, replaced in Task 8):

```tsx
import { StockShell } from "@/components/StockShell";

export default function Page() {
  return (
    <StockShell stock="wire">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="font-display text-5xl font-semibold tracking-tight">DIBS</h1>
      </div>
    </StockShell>
  );
}
```

`src/app/about/page.tsx` (temporary, replaced in Task 10):

```tsx
import { StockShell } from "@/components/StockShell";

export default function Page() {
  return (
    <StockShell stock="reading">
      <div className="measure mx-auto px-5 py-16">
        <h1 className="font-display text-4xl font-semibold">About</h1>
      </div>
    </StockShell>
  );
}
```

Run:

```bash
npx vitest run && npm run build
grep -o 'data-stock="wire"' out/index.html | head -1
grep -o 'data-stock="reading"' out/about/index.html | head -1
```

Expected: tests PASS; both greps print their attribute. Two stocks are live.

```bash
git add -A && git commit -m "feat: port depalo token pairs, the three fonts, and the two stocks"
```

---

### Task 3: Content schema and validation

Validation is what makes the `new` scripts trustworthy: if a script writes malformed frontmatter, the build says so in words a human can act on.

**Files:**
- Create: `src/content/schema.ts`, `src/content/validate.ts`
- Create: `tests/content/validate.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: types `Kind`, `EntryFrontmatter`, `ProjectFrontmatter`, `ProjectStatus`, `Topic`; the `TOPICS` array; `ContentError`; `validateEntry(file: string, data: unknown): EntryFrontmatter`; `validateProject(file: string, data: unknown): ProjectFrontmatter`. Both throw `ContentError` with a message beginning `<file>: `.

- [ ] **Step 1: Write the failing test**

`tests/content/validate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ContentError, validateEntry, validateProject } from "@/content/validate";

const base = { summary: "One or two sentences.", title: "A title", kind: "essay" };

describe("validateEntry", () => {
  it("accepts a minimal essay", () => {
    expect(validateEntry("e.md", base).kind).toBe("essay");
  });

  it("names the file and the missing field", () => {
    expect(() => validateEntry("content/entries/e.md", { ...base, summary: undefined }))
      .toThrow(/^content\/entries\/e\.md: .*summary/);
  });

  it("rejects an unknown kind", () => {
    expect(() => validateEntry("e.md", { ...base, kind: "podcast" }))
      .toThrow(/kind "podcast" is not one of essay, note, link, video/);
  });

  it("requires a title for everything except a note", () => {
    expect(() => validateEntry("e.md", { ...base, title: undefined })).toThrow(/requires "title"/);
    const note = validateEntry("n.md", { summary: "s", kind: "note" });
    expect(note.title).toBeUndefined();
  });

  it("requires url and source on a link", () => {
    expect(() => validateEntry("l.md", { ...base, kind: "link", source: "The Verge" }))
      .toThrow(/kind "link" requires "url"/);
    expect(() => validateEntry("l.md", { ...base, kind: "link", url: "https://x.test" }))
      .toThrow(/kind "link" requires "source"/);
    expect(validateEntry("l.md", { ...base, kind: "link", url: "https://x.test", source: "The Verge" }).url)
      .toBe("https://x.test");
  });

  it("requires an id or url and a channel on a video", () => {
    expect(() => validateEntry("v.md", { ...base, kind: "video", channel: "Some Channel" }))
      .toThrow(/kind "video" requires "video_id" or "video_url"/);
    expect(() => validateEntry("v.md", { ...base, kind: "video", video_id: "abc123" }))
      .toThrow(/kind "video" requires "channel"/);
    expect(validateEntry("v.md", { ...base, kind: "video", video_id: "abc123", channel: "Some Channel" }).video_id)
      .toBe("abc123");
  });

  it("rejects a topic that is not in the topic config", () => {
    expect(() => validateEntry("e.md", { ...base, topics: ["local-aii"] }))
      .toThrow(/topic "local-aii" is not defined/);
    expect(validateEntry("e.md", { ...base, topics: ["local-ai"] }).topics).toEqual(["local-ai"]);
  });

  it("rejects a malformed date", () => {
    expect(() => validateEntry("e.md", { ...base, date: "19/10/2026" }))
      .toThrow(/date must be YYYY-MM-DD/);
  });

  it("rejects a non-boolean draft", () => {
    expect(() => validateEntry("e.md", { ...base, draft: "yes" })).toThrow(/draft must be true or false/);
  });

  it("is a ContentError so callers can catch it specifically", () => {
    expect(() => validateEntry("e.md", {})).toThrow(ContentError);
  });
});

describe("validateProject", () => {
  const project = { title: "Manifest", summary: "s", status: "shipped", year: "2026" };

  it("accepts a minimal project", () => {
    expect(validateProject("p.md", project).status).toBe("shipped");
  });

  it("rejects an unknown status", () => {
    expect(() => validateProject("p.md", { ...project, status: "done" }))
      .toThrow(/status "done" is not one of shipped, building, archived/);
  });

  it("requires title, summary, status and year", () => {
    for (const field of ["title", "summary", "status", "year"] as const) {
      expect(() => validateProject("p.md", { ...project, [field]: undefined }))
        .toThrow(new RegExp(`requires "${field}"`));
    }
  });

  it("validates links as label/url pairs", () => {
    expect(validateProject("p.md", { ...project, links: [{ label: "Site", url: "https://x.test" }] })
      .links).toEqual([{ label: "Site", url: "https://x.test" }]);
    expect(() => validateProject("p.md", { ...project, links: [{ label: "Site" }] }))
      .toThrow(/links\[0\] needs both label and url/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/content/validate.test.ts`
Expected: FAIL — cannot resolve `@/content/validate`.

- [ ] **Step 3: Write the schema**

`src/content/schema.ts`:

```ts
export const KINDS = ["essay", "note", "link", "video"] as const;
export type Kind = (typeof KINDS)[number];

export const PROJECT_STATUSES = ["shipped", "building", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Topic {
  slug: string;
  name: string;
  description: string;
}

/** Desks. A topic that is defined but never used generates no page, and a topic
 *  used in frontmatter but not defined here fails the build. Two are required for
 *  the front page's topics band to render at all (MINIMUMS.topics === 2), so the
 *  site ships with the two desks it actually writes in. */
export const TOPICS: Topic[] = [
  {
    slug: "local-ai",
    name: "Local AI",
    description:
      "Models that run on hardware you own, and what that changes about what you can build.",
  },
  {
    slug: "building",
    name: "Building",
    description:
      "Taking things from an idea to something people can install, and what it costs to get there.",
  },
];

export interface EntryFrontmatter {
  kind: Kind;
  date?: string;
  title?: string;
  summary: string;
  topics?: string[];
  author?: string;
  cover?: string;
  lead?: boolean;
  draft?: boolean;
  updated?: string;
  project?: string;
  /* link */
  url?: string;
  source?: string;
  image?: string;
  /* video */
  video_id?: string;
  video_url?: string;
  channel?: string;
  duration?: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectFrontmatter {
  title: string;
  summary: string;
  status: ProjectStatus;
  year: string;
  role?: string;
  stack?: string[];
  links?: ProjectLink[];
  topics?: string[];
  cover?: string;
}
```

- [ ] **Step 4: Write the validator**

`src/content/validate.ts`:

```ts
import {
  KINDS,
  PROJECT_STATUSES,
  TOPICS,
  type EntryFrontmatter,
  type Kind,
  type ProjectFrontmatter,
  type ProjectLink,
} from "./schema";

export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function fail(file: string, message: string): never {
  throw new ContentError(`${file}: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(file: string, data: Record<string, unknown>, field: string): string | undefined {
  const value = data[field];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim() === "") {
    fail(file, `"${field}" must be a non-empty string`);
  }
  return value;
}

function requiredString(file: string, data: Record<string, unknown>, field: string): string {
  return optionalString(file, data, field) ?? fail(file, `requires "${field}"`);
}

function optionalDate(file: string, data: Record<string, unknown>, field: string): string | undefined {
  const value = optionalString(file, data, field);
  if (value === undefined) return undefined;
  if (!ISO_DATE.test(value)) fail(file, `"${field}" must be YYYY-MM-DD, got "${value}"`);
  return value;
}

function optionalBoolean(file: string, data: Record<string, unknown>, field: string): boolean | undefined {
  const value = data[field];
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") fail(file, `"${field}" must be true or false`);
  return value;
}

function optionalTopics(file: string, data: Record<string, unknown>): string[] | undefined {
  const value = data.topics;
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((t) => typeof t !== "string")) {
    fail(file, `"topics" must be a list of topic slugs`);
  }
  for (const topic of value as string[]) {
    if (!TOPICS.some((t) => t.slug === topic)) {
      fail(file, `topic "${topic}" is not defined in src/content/schema.ts`);
    }
  }
  return value as string[];
}

export function validateEntry(file: string, input: unknown): EntryFrontmatter {
  if (!isRecord(input)) fail(file, "frontmatter is missing");

  const kind = input.kind;
  if (typeof kind !== "string" || !KINDS.includes(kind as Kind)) {
    fail(file, `kind "${String(kind)}" is not one of ${KINDS.join(", ")}`);
  }

  const summary = requiredString(file, input, "summary");
  const title = optionalString(file, input, "title");
  if (title === undefined && kind !== "note") {
    fail(file, `kind "${kind}" requires "title"`);
  }

  if (kind === "link") {
    if (!optionalString(file, input, "url")) fail(file, `kind "link" requires "url"`);
    if (!optionalString(file, input, "source")) fail(file, `kind "link" requires "source"`);
  }

  if (kind === "video") {
    if (!optionalString(file, input, "video_id") && !optionalString(file, input, "video_url")) {
      fail(file, `kind "video" requires "video_id" or "video_url"`);
    }
    if (!optionalString(file, input, "channel")) fail(file, `kind "video" requires "channel"`);
  }

  return {
    kind: kind as Kind,
    date: optionalDate(file, input, "date"),
    title,
    summary,
    topics: optionalTopics(file, input),
    author: optionalString(file, input, "author"),
    cover: optionalString(file, input, "cover"),
    lead: optionalBoolean(file, input, "lead"),
    draft: optionalBoolean(file, input, "draft"),
    updated: optionalDate(file, input, "updated"),
    project: optionalString(file, input, "project"),
    url: optionalString(file, input, "url"),
    source: optionalString(file, input, "source"),
    image: optionalString(file, input, "image"),
    video_id: optionalString(file, input, "video_id"),
    video_url: optionalString(file, input, "video_url"),
    channel: optionalString(file, input, "channel"),
    duration: optionalString(file, input, "duration"),
  };
}

export function validateProject(file: string, input: unknown): ProjectFrontmatter {
  if (!isRecord(input)) fail(file, "frontmatter is missing");

  const status = input.status;
  if (typeof status !== "string" || !PROJECT_STATUSES.includes(status as never)) {
    fail(file, `status "${String(status)}" is not one of ${PROJECT_STATUSES.join(", ")}`);
  }

  let links: ProjectLink[] | undefined;
  if (input.links !== undefined) {
    if (!Array.isArray(input.links)) fail(file, `"links" must be a list`);
    links = input.links.map((item, index) => {
      if (!isRecord(item) || typeof item.label !== "string" || typeof item.url !== "string") {
        fail(file, `links[${index}] needs both label and url`);
      }
      return { label: item.label as string, url: item.url as string };
    });
  }

  const stack = input.stack;
  if (stack !== undefined && (!Array.isArray(stack) || stack.some((s) => typeof s !== "string"))) {
    fail(file, `"stack" must be a list of strings`);
  }

  return {
    title: requiredString(file, input, "title"),
    summary: requiredString(file, input, "summary"),
    status: status as ProjectFrontmatter["status"],
    year: requiredString(file, input, "year"),
    role: optionalString(file, input, "role"),
    stack: stack as string[] | undefined,
    links,
    topics: optionalTopics(file, input),
    cover: optionalString(file, input, "cover"),
  };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run tests/content/validate.test.ts`
Expected: PASS — 17 tests.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: content schema and frontmatter validation with readable failures"
```

---

### Task 4: The content layer

Everything that knows the shape of an entry lives here. It is pure and synchronous except for reading files, which makes every rule in the spec directly testable.

**Files:**
- Create: `src/content/derive.ts`, `src/content/load.ts`, `src/lib/format.ts`
- Create: `tests/content/derive.test.ts`, `tests/content/load.test.ts`, `tests/lib/format.test.ts`

**Interfaces:**
- Consumes: `validateEntry`, `validateProject`, `ContentError`, `TOPICS`, `EntryFrontmatter`, `ProjectFrontmatter`.
- Produces:
  - `interface Entry extends Omit<EntryFrontmatter, "title"> { slug: string; date: string; title: string; titleDerived: boolean; body: string; file: string }`
  - `interface Project extends ProjectFrontmatter { slug: string; body: string; file: string }`
  - `parseFilename(name): { date, slug } | null`
  - `entryDate(filename, declared?): string`
  - `noteHeadline(body, max?): string`
  - `sortEntries<T extends { date: string; slug: string }>(items: T[]): T[]`
  - `publishedOnly<T extends { draft?: boolean }>(items: T[]): T[]`
  - `loadEntries(dir?): Entry[]`, `loadProjects(dir?): Project[]`, `loadContent(root?): { entries, projects }`
  - `formatWhen(iso: string, now: Date): string`

- [ ] **Step 1: Write the failing tests**

`tests/content/derive.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { entryDate, noteHeadline, parseFilename, publishedOnly, sortEntries } from "@/content/derive";

describe("parseFilename", () => {
  it("splits the date prefix from the slug", () => {
    expect(parseFilename("2026-10-19-on-device-inference.md")).toEqual({
      date: "2026-10-19",
      slug: "on-device-inference",
    });
  });

  it("returns null when the name has no date prefix", () => {
    expect(parseFilename("loose-note.md")).toBeNull();
  });
});

describe("entryDate", () => {
  it("uses the filename date by default", () => {
    expect(entryDate("2026-10-19-x.md")).toBe("2026-10-19");
  });

  it("lets an explicit date override the filename", () => {
    expect(entryDate("2026-10-19-x.md", "2026-01-02")).toBe("2026-01-02");
  });

  it("throws on a name with no date and no declared date", () => {
    expect(() => entryDate("loose.md")).toThrow(/needs a YYYY-MM-DD filename prefix/);
  });
});

describe("noteHeadline", () => {
  it("takes the first sentence", () => {
    expect(noteHeadline("Local models got good. This one runs on a laptop."))
      .toBe("Local models got good.");
  });

  it("handles a body with no full stop by truncating", () => {
    const body = "a".repeat(40) + " " + "b".repeat(200);
    const headline = noteHeadline(body);
    expect(headline.endsWith("…")).toBe(true);
    expect(headline.length).toBeLessThanOrEqual(161);
  });

  it("keeps a short body intact", () => {
    expect(noteHeadline("Short.")).toBe("Short.");
  });

  it("collapses whitespace so a multi-line note still has a one-line headline", () => {
    expect(noteHeadline("  Two\n\nlines.  Next. ")).toBe("Two lines.");
  });
});

describe("sortEntries", () => {
  it("sorts newest first and breaks ties by slug", () => {
    const sorted = sortEntries([
      { date: "2026-01-01", slug: "b" },
      { date: "2026-02-01", slug: "a" },
      { date: "2026-01-01", slug: "a" },
    ]);
    expect(sorted.map((e) => `${e.date}/${e.slug}`)).toEqual([
      "2026-02-01/a",
      "2026-01-01/a",
      "2026-01-01/b",
    ]);
  });
});

describe("publishedOnly", () => {
  it("drops drafts and keeps everything else", () => {
    expect(publishedOnly([{ draft: true }, {}, { draft: false }])).toHaveLength(2);
  });
});
```

`tests/lib/format.test.ts`:

```ts
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
```

`tests/content/load.test.ts`:

```ts
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
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
    write("entries/2026-10-19-bad.md", "---\nkind: video\ntitle: B\nsummary: s\n---\n\nx\n");
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

  it("fails on two projects with the same slug", () => {
    write("projects/manifest.md", "---\ntitle: A\nsummary: s\nstatus: shipped\nyear: \"2026\"\n---\n\nx\n");
    write("projects/MANIFEST.md", "---\ntitle: B\nsummary: s\nstatus: shipped\nyear: \"2026\"\n---\n\nx\n");
    expect(() => loadProjects(join(root, "projects"))).toThrow(/duplicate project slug "manifest"/);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run tests/content/derive.test.ts tests/content/load.test.ts tests/lib/format.test.ts`
Expected: FAIL — modules cannot be resolved.

- [ ] **Step 3: Write the derived values**

`src/content/derive.ts`:

```ts
const PREFIX = /^(\d{4}-\d{2}-\d{2})-(.+)$/;
const FULL_STOP = /[.!?](?=\s|$)/;

export function parseFilename(name: string): { date: string; slug: string } | null {
  const match = name.replace(/\.md$/, "").match(PREFIX);
  return match ? { date: match[1], slug: match[2] } : null;
}

export function entryDate(filename: string, declared?: string): string {
  const parsed = parseFilename(filename);
  if (declared) return declared;
  if (!parsed) throw new Error(`${filename}: needs a YYYY-MM-DD filename prefix`);
  return parsed.date;
}

/** A note's headline, when it has no title. First sentence, then a hard cap at a
 *  word boundary. This is what keeps posting a note to twenty seconds of work. */
export function noteHeadline(body: string, max = 160): string {
  const text = body.replace(/\s+/g, " ").trim();
  const stop = text.match(FULL_STOP);
  const sentence = stop ? text.slice(0, stop.index! + 1) : text;
  if (sentence.length <= max) return sentence;
  const clipped = sentence.slice(0, max);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

export function sortEntries<T extends { date: string; slug: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  );
}

export function publishedOnly<T extends { draft?: boolean }>(items: T[]): T[] {
  return items.filter((item) => !item.draft);
}
```

- [ ] **Step 4: Write the formatter**

`src/lib/format.ts`:

```ts
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Newsroom convention: relative for the first 48 hours, absolute after. An item
 *  from March says "12 March", never "4 months ago" — that is what stops a quiet
 *  fortnight reading as neglect. */
export function formatWhen(iso: string, now: Date): string {
  const then = new Date(iso);
  const diff = now.getTime() - then.getTime();

  if (diff < MINUTE) return "just now";
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (diff < 2 * DAY) return "yesterday";

  const sameYear = then.getUTCFullYear() === now.getUTCFullYear();
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "UTC",
  }).format(then);
}
```

- [ ] **Step 5: Write the loader**

`src/content/load.ts`:

```ts
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { entryDate, noteHeadline, parseFilename, publishedOnly, sortEntries } from "./derive";
import type { EntryFrontmatter, ProjectFrontmatter } from "./schema";
import { ContentError, validateEntry, validateProject } from "./validate";

export interface Entry extends Omit<EntryFrontmatter, "title"> {
  slug: string;
  date: string;
  title: string;
  titleDerived: boolean;
  body: string;
  file: string;
}

export interface Project extends ProjectFrontmatter {
  slug: string;
  body: string;
  file: string;
}

function markdownFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort();
}

export function loadEntries(dir = "content/entries"): Entry[] {
  const entries = markdownFiles(dir).map((name): Entry => {
    const file = join(dir, name);
    const raw = matter(readFileSync(file, "utf8"));
    const front = validateEntry(file, raw.data);
    const parsed = parseFilename(name);
    if (!parsed) {
      throw new ContentError(`${file}: needs a YYYY-MM-DD filename prefix`);
    }
    const body = raw.content.trim();
    const derived = front.title === undefined;
    return {
      ...front,
      slug: parsed.slug,
      date: entryDate(name, front.date),
      title: front.title ?? noteHeadline(body),
      titleDerived: derived,
      body,
      file,
    };
  });

  return sortEntries(publishedOnly(entries));
}

export function loadProjects(dir = "content/projects"): Project[] {
  const seen = new Set<string>();
  const projects = markdownFiles(dir).map((name): Project => {
    const file = join(dir, name);
    const raw = matter(readFileSync(file, "utf8"));
    const front = validateProject(file, raw.data);
    const slug = name.replace(/\.md$/, "").toLowerCase();
    if (seen.has(slug)) {
      throw new ContentError(`${file}: duplicate project slug "${slug}"`);
    }
    seen.add(slug);
    return { ...front, slug, body: raw.content.trim(), file };
  });

  return projects.sort((a, b) => b.year.localeCompare(a.year) || a.slug.localeCompare(b.slug));
}

export function loadContent(root = "content"): { entries: Entry[]; projects: Project[] } {
  const entries = loadEntries(join(root, "entries"));
  const projects = loadProjects(join(root, "projects"));
  const known = new Set(projects.map((p) => p.slug));

  for (const entry of entries) {
    if (entry.project && !known.has(entry.project)) {
      throw new ContentError(`${entry.file}: project "${entry.project}" does not exist`);
    }
  }

  return { entries, projects };
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run tests/content tests/lib`
Expected: PASS — derive, load and format suites all green.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: content layer with derived titles, dates, drafts and project refs"
```

---

### Task 5: Markdown rendering

One module, one job: markdown string in, HTML string out. This is the module MDX would replace if inline components are ever wanted — which is why nothing else imports `remark`.

**Files:**
- Create: `src/content/render.ts`, `src/components/Prose.tsx`
- Create: `tests/content/render.test.ts`
- Modify: `package.json` (dependencies)

**Interfaces:**
- Consumes: nothing.
- Produces: `renderMarkdown(body: string): Promise<string>`; `Prose({ html }: { html: string })`.

- [ ] **Step 1: Write the failing test**

`tests/content/render.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/content/render.test.ts`
Expected: FAIL — cannot resolve `@/content/render`.

- [ ] **Step 3: Install the markdown pipeline and write the module**

```bash
npm i remark remark-gfm remark-rehype rehype-slug rehype-stringify
```

`src/content/render.ts`:

```ts
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

/** The only place markdown syntax is understood. If MDX is adopted later, it is
 *  adopted here and nowhere else. */
export async function renderMarkdown(body: string): Promise<string> {
  const file = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(body);

  return String(file);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/content/render.test.ts`
Expected: PASS — 4 tests.

- [ ] **Step 5: Write the Prose component**

`src/components/Prose.tsx`:

```tsx
/** `dangerouslySetInnerHTML` is safe here for exactly one reason: the only string
 *  it is ever given comes from `renderMarkdown()` over markdown committed in this
 *  repository. No request, query value, database row or reader input reaches it.
 *  If that stops being true, this stops being safe. */
export function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose-body font-display text-[1.0625rem] leading-[1.7] [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-highlight [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_code]:font-mono [&_code]:text-[0.9em] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_hr]:my-10 [&_hr]:border-border [&_img]:my-8 [&_img]:h-auto [&_img]:max-w-full [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-control [&_pre]:bg-muted [&_pre]:p-4 [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

- [ ] **Step 6: Verify the whole suite, then commit**

Run: `npx vitest run`
Expected: PASS — all suites.

```bash
git add -A && git commit -m "feat: markdown rendering behind a single module, and the Prose surface"
```

---

### Task 6: Front page assembly (the load-bearing function)

This is the piece the whole design rests on, and it is pure, so it can be tested at every volume the spec names — 1, 2, 3, 4, 5 and 30 items — without rendering anything.

**Files:**
- Create: `src/content/frontpage.ts`
- Create: `tests/content/frontpage.test.ts`
- Create: `tests/helpers/fixtures.ts`

**Interfaces:**
- Consumes: `Entry`, `Project` (Task 4), `Topic`, `TOPICS` (Task 3), `publishedOnly`, `sortEntries` (Task 4).
- Produces:
  - `MINIMUMS` (`{ bunks: 2, feed: 1, watch: 3, projects: 2, topics: 2 }`)
  - `pickLead(entries: Entry[]): Entry`
  - `topicsInUse(entries: Entry[], projects: Project[]): Topic[]`
  - `assembleFrontPage(entries, projects, topics?): FrontPage`
  - `type FrontPage = { state: "empty" } | { state: "assembled"; lead: Entry; bunks: Entry[]; feed: Entry[]; watch: Entry[]; projects: Project[]; topics: Topic[] }`

- [ ] **Step 1: Write the fixtures helper**

`tests/helpers/fixtures.ts`:

```ts
import type { Entry, Project } from "@/content/load";
import type { Kind } from "@/content/schema";

let counter = 0;

export function entry(overrides: Partial<Entry> & { kind?: Kind } = {}): Entry {
  counter += 1;
  const kind = overrides.kind ?? "note";
  return {
    kind,
    slug: overrides.slug ?? `entry-${counter}`,
    date: overrides.date ?? "2026-10-01",
    title: overrides.title ?? `Entry ${counter}`,
    titleDerived: false,
    summary: overrides.summary ?? "A summary.",
    body: overrides.body ?? "Body.",
    file: overrides.file ?? `content/entries/${overrides.slug ?? counter}.md`,
    ...overrides,
  } as Entry;
}

export function project(overrides: Partial<Project> = {}): Project {
  counter += 1;
  return {
    title: overrides.title ?? `Project ${counter}`,
    summary: overrides.summary ?? "A project.",
    status: overrides.status ?? "shipped",
    year: overrides.year ?? "2026",
    slug: overrides.slug ?? `project-${counter}`,
    body: overrides.body ?? "Body.",
    file: overrides.file ?? `content/projects/${overrides.slug ?? counter}.md`,
    ...overrides,
  } as Project;
}

/** n entries, newest first, dates descending from 2026-10-19. */
export function entries(n: number, overrides: Partial<Entry> = {}): Entry[] {
  return Array.from({ length: n }, (_, i) => {
    const day = String(19 - i).padStart(2, "0");
    return entry({ slug: `e${i}`, date: `2026-10-${day}`, ...overrides });
  });
}
```

- [ ] **Step 2: Write the failing tests**

`tests/content/frontpage.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { assembleFrontPage, MINIMUMS, pickLead, topicsInUse } from "@/content/frontpage";
import { TOPICS } from "@/content/schema";
import { entries as makeEntries, entry, project } from "../helpers/fixtures";

const assembled = (n: number) => {
  const page = assembleFrontPage(makeEntries(n), [], TOPICS);
  if (page.state !== "assembled") throw new Error("expected assembled");
  return page;
};

describe("assembleFrontPage — volume", () => {
  it("returns an empty state with no content", () => {
    expect(assembleFrontPage([], [], TOPICS)).toEqual({ state: "empty" });
  });

  it("renders a lead alone when there is one item", () => {
    const page = assembled(1);
    expect(page.lead.slug).toBe("e0");
    expect(page.bunks).toEqual([]);
    expect(page.feed).toEqual([]);
  });

  it("never strands the second item: it falls through to the feed", () => {
    const page = assembled(2);
    expect(page.lead.slug).toBe("e0");
    expect(page.bunks).toEqual([]);
    expect(page.feed.map((e) => e.slug)).toEqual(["e1"]);
  });

  it("uses lead plus two bunks at three items, with no feed", () => {
    const page = assembled(3);
    expect(page.bunks).toHaveLength(2);
    expect(page.feed).toEqual([]);
  });

  it("uses lead plus three bunks at four items", () => {
    expect(assembled(4).bunks).toHaveLength(3);
  });

  it("leaves one item in the feed at five items", () => {
    const page = assembled(5);
    expect(page.bunks).toHaveLength(3);
    expect(page.feed).toHaveLength(1);
  });

  it("keeps every item exactly once across lead, bunks and feed", () => {
    for (const n of [1, 2, 3, 4, 5, 30]) {
      const page = assembled(n);
      const slugs = [page.lead.slug, ...page.bunks.map((e) => e.slug), ...page.feed.map((e) => e.slug)];
      expect(new Set(slugs).size).toBe(n);
    }
  });

  it("caps bunks at three even at thirty items", () => {
    const page = assembled(30);
    expect(page.bunks).toHaveLength(3);
    expect(page.feed).toHaveLength(26);
  });
});

describe("assembleFrontPage — lead precedence", () => {
  it("honours an explicit lead even when it is not the newest", () => {
    const items = makeEntries(3);
    items[2].lead = true;
    expect(pickLead(items).slug).toBe(items[2].slug);
  });

  it("prefers the newest essay over a newer note", () => {
    const items = [entry({ slug: "note", kind: "note", date: "2026-10-19" }),
                   entry({ slug: "essay", kind: "essay", date: "2026-10-01" })];
    expect(pickLead(items).slug).toBe("essay");
  });

  it("falls back to the newest item of any kind", () => {
    const items = [entry({ slug: "a", kind: "note", date: "2026-10-18" }),
                   entry({ slug: "b", kind: "video", date: "2026-10-19" })];
    expect(pickLead(items).slug).toBe("b");
  });
});

describe("assembleFrontPage — bands and minimums", () => {
  it("hides the watch band below three videos", () => {
    const page = assembleFrontPage(
      [...makeEntries(1), entry({ kind: "video", slug: "v1" }), entry({ kind: "video", slug: "v2" })],
      [], TOPICS,
    );
    if (page.state !== "assembled") throw new Error("expected assembled");
    expect(page.watch).toEqual([]);
  });

  it("shows the watch band at three videos, newest first", () => {
    const videos = [1, 2, 3].map((n) => entry({ kind: "video", slug: `v${n}`, date: `2026-10-0${n}` }));
    const page = assembleFrontPage([...makeEntries(1), ...videos], [], TOPICS);
    if (page.state !== "assembled") throw new Error("expected assembled");
    expect(page.watch.map((e) => e.slug)).toEqual(["v3", "v2", "v1"]);
  });

  it("hides the projects band below two projects", () => {
    const page = assembleFrontPage(makeEntries(1), [project()], TOPICS);
    if (page.state !== "assembled") throw new Error("expected assembled");
    expect(page.projects).toEqual([]);
    expect(MINIMUMS.projects).toBe(2);
  });

  it("hides the topics band unless two topics are actually in use", () => {
    const page = assembleFrontPage(makeEntries(3, { topics: ["local-ai"] }), [], TOPICS);
    if (page.state !== "assembled") throw new Error("expected assembled");
    expect(page.topics).toEqual([]);
  });

  it("lists only topics in use, in config order", () => {
    const used = [
      entry({ slug: "a", topics: ["local-ai"] }),
      project({ slug: "p", topics: ["local-ai"] }),
    ];
    expect(topicsInUse(used as never, []).map((t) => t.slug)).toEqual(["local-ai"]);
  });
});

describe("assembleFrontPage — drafts", () => {
  it("excludes drafts from every band", () => {
    const items = [entry({ slug: "live", date: "2026-10-19" }),
                   entry({ slug: "draft", date: "2026-10-18", draft: true })];
    const page = assembleFrontPage(items, [], TOPICS);
    if (page.state !== "assembled") throw new Error("expected assembled");
    const slugs = [page.lead.slug, ...page.bunks.map((e) => e.slug), ...page.feed.map((e) => e.slug)];
    expect(slugs).not.toContain("draft");
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `npx vitest run tests/content/frontpage.test.ts`
Expected: FAIL — cannot resolve `@/content/frontpage`.

- [ ] **Step 4: Write the assembly**

`src/content/frontpage.ts`:

```ts
import { publishedOnly, sortEntries } from "./derive";
import type { Entry, Project } from "./load";
import { TOPICS, type Topic } from "./schema";

export const MINIMUMS = {
  bunks: 2,
  feed: 1,
  watch: 3,
  projects: 2,
  topics: 2,
} as const;

export type FrontPage =
  | { state: "empty" }
  | {
      state: "assembled";
      lead: Entry;
      bunks: Entry[];
      feed: Entry[];
      watch: Entry[];
      projects: Project[];
      topics: Topic[];
    };

/** Explicit override first, then the newest essay, then the newest anything.
 *  Never throws, never returns undefined for a non-empty corpus. */
export function pickLead(entries: Entry[]): Entry {
  return (
    entries.find((entry) => entry.lead) ??
    entries.find((entry) => entry.kind === "essay") ??
    entries[0]
  );
}

export function topicsInUse(entries: Entry[], projects: Project[]): Topic[] {
  const used = new Set<string>();
  for (const item of [...entries, ...projects]) {
    for (const topic of item.topics ?? []) used.add(topic);
  }
  return TOPICS.filter((topic) => used.has(topic.slug));
}

/** The front page assembles itself from what is real. Two rules keep it honest:
 *  a band below its minimum does not render, and no item is ever stranded —
 *  bunks only take items that leave a feed behind, and the feed catches the rest. */
export function assembleFrontPage(
  entries: Entry[],
  projects: Project[],
  topics: Topic[] = TOPICS,
): FrontPage {
  const live = sortEntries(publishedOnly(entries));
  if (live.length === 0) return { state: "empty" };

  const lead = pickLead(live);
  const pool = live.filter((entry) => entry !== lead);

  const bunks = pool.length >= MINIMUMS.bunks ? pool.slice(0, 3) : [];
  const feed = pool.slice(bunks.length);

  /* Watch repeats items already in the feed on purpose: a newsroom front page
     surfaces the same story in more than one block. */
  const videos = live.filter((entry) => entry.kind === "video").slice(0, 6);
  const watch = videos.length >= MINIMUMS.watch ? videos : [];

  const projectBand = projects.length >= MINIMUMS.projects ? projects.slice(0, 3) : [];

  const inUse = topicsInUse(live, projects);
  const topicBand = inUse.length >= MINIMUMS.topics ? inUse : [];

  return {
    state: "assembled",
    lead,
    bunks,
    feed,
    watch,
    projects: projectBand,
    topics: topicBand,
  };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run tests/content/frontpage.test.ts`
Expected: PASS — 16 tests, including the "every item exactly once" loop across six volumes.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: self-assembling front page with per-band minimums and no stranded items"
```

---

### Task 7: Cards, plates and kind tags

No cover image never means a grey rectangle. The plate is a card, a thumbnail, a row and (Task 13) a social preview — one component doing four jobs.

**Files:**
- Create: `src/content/routes.ts`
- Create: `src/components/KindTag.tsx`, `src/components/Plate.tsx`, `src/components/Card.tsx`
- Create: `tests/components/card.test.tsx`

**Interfaces:**
- Consumes: `Entry` (Task 4), `formatWhen` (Task 4).
- Produces: `SECTION_OF_KIND: Record<Kind, string>`; `entryPath(entry): string`; `topicPath(slug): string`; `projectPath(project): string`; `KIND_LABELS: Record<Kind, string>`; `topicColour(slug?: string): string`; `KindTag({ kind })`; `Plate({ entry, size })` with `size: "lead" | "card" | "row"`; `Card({ entry, size?, now })`.

- [ ] **Step 1: Write the failing test**

`tests/components/card.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/Card";
import { Plate } from "@/components/Plate";
import { entry } from "../helpers/fixtures";

const NOW = new Date("2026-10-19T12:00:00Z");

describe("Plate", () => {
  it("renders a typographic plate when there is no cover", () => {
    const { container } = render(
      <Plate entry={entry({ slug: "x", title: "On-device inference", topics: ["local-ai"] })} />,
    );
    expect(screen.getByText("On-device inference")).toBeTruthy();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[data-plate]")).toBeTruthy();
  });

  it("labels the kind", () => {
    render(<Plate entry={entry({ kind: "video", title: "A talk" })} />);
    expect(screen.getByText(/Video/)).toBeTruthy();
  });
});

describe("Card", () => {
  it("shows a cover when one exists", () => {
    const { container } = render(
      <Card entry={entry({ slug: "x", cover: "/c.webp", title: "Covered" })} now={NOW} />,
    );
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/c.webp");
  });

  it("falls back to the plate when there is no cover", () => {
    const { container } = render(<Card entry={entry({ slug: "y", title: "Uncovered" })} now={NOW} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[data-plate]")).toBeTruthy();
  });

  it("links to the item and shows a relative timestamp inside 48 hours", () => {
    const { container } = render(
      <Card entry={entry({ slug: "recent", kind: "note", date: "2026-10-19", title: "T" })} now={NOW} />,
    );
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/notes/recent/");
    expect(screen.getByText("12 hours ago")).toBeTruthy();
  });

  it("links a video card to watch and an essay to essays", () => {
    const { container: video } = render(
      <Card entry={entry({ slug: "v", kind: "video", title: "V" })} now={NOW} />,
    );
    const { container: essay } = render(
      <Card entry={entry({ slug: "e", kind: "essay", title: "E" })} now={NOW} />,
    );
    expect(video.querySelector("a")?.getAttribute("href")).toBe("/watch/v/");
    expect(essay.querySelector("a")?.getAttribute("href")).toBe("/essays/e/");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/components/card.test.tsx`
Expected: FAIL — components cannot be resolved.

- [ ] **Step 3: Write the route map, the kind tag and the plate**

`src/content/routes.ts` — the one place a kind becomes a URL segment. `Card`, `Lead`, the feeds and the metadata all import this; none of them keep a copy.

```ts
import type { Entry, Project } from "./load";

export const SECTION_OF_KIND: Record<Entry["kind"], string> = {
  essay: "essays",
  note: "notes",
  link: "notes",
  video: "watch",
};

export function entryPath(entry: Entry): string {
  return `/${SECTION_OF_KIND[entry.kind]}/${entry.slug}/`;
}

export function projectPath(project: Project): string {
  return `/projects/${project.slug}/`;
}

export function topicPath(slug: string): string {
  return `/topics/${slug}/`;
}
```

`src/components/KindTag.tsx`:

```tsx
import type { Kind } from "@/content/schema";

export const KIND_LABELS: Record<Kind, string> = {
  essay: "Essay",
  note: "Note",
  link: "Link",
  video: "Video",
};

export function KindTag({ kind }: { kind: Kind }) {
  return (
    <span className="record text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">
      {KIND_LABELS[kind]}
    </span>
  );
}
```

`src/components/Plate.tsx`:

```tsx
import type { Entry } from "@/content/load";
import { KIND_LABELS } from "./KindTag";

const TOPIC_COLOUR: Record<string, string> = {
  "local-ai": "var(--highlight)",
};

export function topicColour(slug?: string): string {
  return (slug && TOPIC_COLOUR[slug]) || "var(--primary)";
}

const ASPECT = {
  lead: "aspect-[16/9] md:aspect-[21/9]",
  card: "aspect-[16/10]",
  row: "aspect-[4/3]",
} as const;

/** The cover when there is one; this when there is not. A typographic plate is
 *  never a placeholder — it is a finished treatment, which is why an image-less
 *  news page does not look like a wireframe. */
export function Plate({ entry, size = "card" }: { entry: Entry; size?: keyof typeof ASPECT }) {
  const topic = entry.topics?.[0];
  return (
    <div
      data-plate
      className={`relative flex ${ASPECT[size]} w-full flex-col justify-between overflow-hidden border border-border bg-card p-5`}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: topicColour(topic) }}
      />
      <span className="record text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">
        {KIND_LABELS[entry.kind]}
        {topic ? ` · ${topic}` : ""}
      </span>
      <span className="font-display text-2xl font-semibold leading-tight text-foreground">
        {entry.title}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Write the card**

`src/components/Card.tsx`:

```tsx
import Link from "next/link";
import type { Entry } from "@/content/load";
import { entryPath } from "@/content/routes";
import { formatWhen } from "@/lib/format";
import { KindTag } from "./KindTag";
import { Plate } from "./Plate";

export function Card({
  entry,
  size = "card",
  now = new Date(),
}: {
  entry: Entry;
  size?: "card" | "row";
  now?: Date;
}) {
  const href = entryPath(entry);

  return (
    <article className="flex flex-col gap-3">
      <Link href={href} className="no-underline">
        {entry.cover ? (
          <img
            src={entry.cover}
            alt=""
            width={1200}
            height={750}
            className="aspect-[16/10] w-full border border-border object-cover"
            loading="lazy"
          />
        ) : (
          <Plate entry={entry} size={size} />
        )}
      </Link>
      <div className="flex items-baseline gap-3">
        <KindTag kind={entry.kind} />
        <time className="record text-[0.6875rem] text-muted-foreground" dateTime={entry.date}>
          {formatWhen(`${entry.date}T12:00:00Z`, now)}
        </time>
      </div>
      <h3 className="m-0 font-display text-xl font-semibold leading-snug">
        <Link href={href} className="no-underline hover:underline hover:underline-offset-4">
          {entry.title}
        </Link>
      </h3>
      {size === "row" && <p className="m-0 text-sm text-muted-foreground">{entry.summary}</p>}
    </article>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run tests/components/card.test.tsx`
Expected: PASS — 6 tests.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: cards, typographic plates and kind tags"
```

---

### Task 8: The front page route

The page file stays thin: load, assemble, hand the result to a view component. All the interesting assertions live against the view, where they run without a filesystem.

**Files:**
- Create: `src/components/Lead.tsx`, `src/components/Rail.tsx`, `src/components/Band.tsx`, `src/components/FrontPageView.tsx`
- Modify: `src/app/page.tsx`
- Create: `tests/components/frontpage-view.test.tsx`

**Interfaces:**
- Consumes: `FrontPage`, `assembleFrontPage`, `loadContent`, `Card`, `Plate`.
- Produces: `FrontPageView({ page, now })`; bands carry `data-band` attributes (`lead`, `bunks`, `feed`, `watch`, `projects`, `topics`) for testing and auditing.

- [ ] **Step 1: Write the failing test**

`tests/components/frontpage-view.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { FrontPageView } from "@/components/FrontPageView";
import { assembleFrontPage } from "@/content/frontpage";
import { TOPICS } from "@/content/schema";
import { entries, entry, project } from "../helpers/fixtures";

const NOW = new Date("2026-10-19T12:00:00Z");

function view(n: number, extra: Parameters<typeof assembleFrontPage>[0] = [], projects: Parameters<typeof assembleFrontPage>[1] = []) {
  const page = assembleFrontPage([...entries(n), ...extra], projects, TOPICS);
  return render(<FrontPageView page={page} now={NOW} />);
}

describe("FrontPageView", () => {
  it("renders a lead and no feed at three items", () => {
    const { container } = view(3);
    expect(container.querySelector('[data-band="lead"]')).toBeTruthy();
    expect(container.querySelector('[data-band="bunks"]')).toBeTruthy();
    expect(container.querySelector('[data-band="feed"]')).toBeNull();
  });

  it("renders the feed and rail at thirty items", () => {
    const { container } = view(30);
    expect(container.querySelector('[data-band="feed"]')).toBeTruthy();
    expect(container.querySelector('[data-band="rail"]')).toBeTruthy();
  });

  it("renders no watch band below three videos", () => {
    const vids = [1, 2].map((n) => entry({ kind: "video", slug: `v${n}`, date: `2026-10-0${n}` }));
    const { container } = view(4, vids);
    expect(container.querySelector('[data-band="watch"]')).toBeNull();
  });

  it("renders the watch band at three videos", () => {
    const vids = [1, 2, 3].map((n) => entry({ kind: "video", slug: `v${n}`, date: `2026-10-0${n}` }));
    const { container } = view(4, vids);
    expect(container.querySelector('[data-band="watch"]')).toBeTruthy();
  });

  it("renders no projects band with one project", () => {
    const { container } = view(4, [], [project()]);
    expect(container.querySelector('[data-band="projects"]')).toBeNull();
  });

  it("renders the projects band with two", () => {
    const { container } = view(4, [], [project({ slug: "a" }), project({ slug: "b" })]);
    expect(container.querySelector('[data-band="projects"]')).toBeTruthy();
  });

  it("renders a quiet empty state rather than a broken page", () => {
    const { container } = render(
      <FrontPageView page={assembleFrontPage([], [], TOPICS)} now={NOW} />,
    );
    expect(container.querySelector('[data-band="lead"]')).toBeNull();
    expect(container.textContent).toContain("Nothing published yet");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/components/frontpage-view.test.tsx`
Expected: FAIL — `@/components/FrontPageView` cannot be resolved.

- [ ] **Step 3: Write the lead, rail and band**

`src/components/Lead.tsx`:

```tsx
import Link from "next/link";
import type { Entry } from "@/content/load";
import { entryPath } from "@/content/routes";
import { formatWhen } from "@/lib/format";
import { KindTag } from "./KindTag";

export function Lead({ entry, now }: { entry: Entry; now: Date }) {
  const href = entryPath(entry);
  return (
    <section data-band="lead" className="border-b border-border py-8">
      <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-3">
            <KindTag kind={entry.kind} />
            <time className="record text-[0.6875rem] text-muted-foreground" dateTime={entry.date}>
              {formatWhen(`${entry.date}T12:00:00Z`, now)}
            </time>
          </div>
          <h2 className="m-0 font-display text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight">
            <Link href={href} className="no-underline hover:underline hover:underline-offset-4">
              {entry.title}
            </Link>
          </h2>
          <p className="m-0 max-w-prose font-display text-lg text-muted-foreground">{entry.summary}</p>
        </div>
        {entry.cover && (
          <img
            src={entry.cover}
            alt=""
            width={1200}
            height={675}
            className="aspect-[16/9] w-full border border-border object-cover"
          />
        )}
      </div>
    </section>
  );
}
```

`src/components/Band.tsx`:

```tsx
import Link from "next/link";

export function Band({
  id,
  title,
  href,
  children,
}: {
  id: string;
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section data-band={id} className="border-t border-border py-8">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="m-0 font-display text-xl font-semibold">{title}</h2>
        <Link href={href} className="font-ui text-sm text-muted-foreground no-underline hover:text-foreground">
          All {title.toLowerCase()} →
        </Link>
      </div>
      {children}
    </section>
  );
}
```

`src/components/Rail.tsx`:

```tsx
import Link from "next/link";
import type { FrontPage } from "@/content/frontpage";
import { KIND_LABELS } from "./KindTag";

/** Built from whatever exists. A section with nothing in it contributes no block
 *  and no apology line. */
export function Rail({ page }: { page: Extract<FrontPage, { state: "assembled" }> }) {
  return (
    <aside data-band="rail" className="flex flex-col gap-8 font-ui text-sm lg:border-l lg:border-border lg:pl-6">
      {page.watch.length > 0 && (
        <div>
          <h2 className="record m-0 mb-3 text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">Latest from Watch</h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {page.watch.slice(0, 4).map((entry) => (
              <li key={entry.slug}>
                <Link href={`/watch/${entry.slug}/`} className="no-underline hover:underline">{entry.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {page.projects.length > 0 && (
        <div>
          <h2 className="record m-0 mb-3 text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">Projects</h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {page.projects.map((project) => (
              <li key={project.slug}>
                <Link href={`/projects/${project.slug}/`} className="no-underline hover:underline">{project.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {page.topics.length > 0 && (
        <div>
          <h2 className="record m-0 mb-3 text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">Topics</h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {page.topics.map((topic) => (
              <li key={topic.slug}>
                <Link href={`/topics/${topic.slug}/`} className="no-underline hover:underline">{topic.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
```

- [ ] **Step 4: Write the view**

`src/components/FrontPageView.tsx`:

```tsx
import type { FrontPage } from "@/content/frontpage";
import { Card } from "./Card";
import { Lead } from "./Lead";
import { Rail } from "./Rail";
import { Band } from "./Band";

export function FrontPageView({ page, now }: { page: FrontPage; now: Date }) {
  if (page.state === "empty") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <p className="font-display text-lg text-muted-foreground">Nothing published yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5">
      <Lead entry={page.lead} now={now} />

      {page.bunks.length > 0 && (
        <section data-band="bunks" className="grid gap-8 border-b border-border py-8 sm:grid-cols-3">
          {page.bunks.map((entry) => (
            <Card key={entry.slug} entry={entry} now={now} />
          ))}
        </section>
      )}

      {page.feed.length > 0 && (
        <section data-band="feed" className="grid gap-10 border-b border-border py-8 lg:grid-cols-[1fr_18rem]">
          <div className="flex flex-col gap-10">
            {page.feed.map((entry) => (
              <Card key={entry.slug} entry={entry} size="row" now={now} />
            ))}
          </div>
          <Rail page={page} />
        </section>
      )}

      {page.watch.length > 0 && (
        <Band id="watch" title="Watch" href="/watch/">
          <div className="grid gap-8 sm:grid-cols-3">
            {page.watch.slice(0, 3).map((entry) => (
              <Card key={entry.slug} entry={entry} now={now} />
            ))}
          </div>
        </Band>
      )}

      {page.projects.length > 0 && (
        <Band id="projects" title="Projects" href="/projects/">
          <div className="grid gap-8 sm:grid-cols-3">
            {page.projects.map((project) => (
              <article key={project.slug} className="flex flex-col gap-2">
                <p className="record m-0 text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">
                  {project.status} · {project.year}
                </p>
                <h3 className="m-0 font-display text-xl font-semibold">
                  <a href={`/projects/${project.slug}/`} className="no-underline hover:underline">{project.title}</a>
                </h3>
                <p className="m-0 text-sm text-muted-foreground">{project.summary}</p>
              </article>
            ))}
          </div>
        </Band>
      )}

      {page.topics.length > 0 && (
        <Band id="topics" title="Topics" href="/topics/">
          <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
            {page.topics.map((topic) => (
              <li key={topic.slug}>
                <a
                  href={`/topics/${topic.slug}/`}
                  className="inline-block rounded-control border border-border px-3 py-1.5 font-ui text-sm no-underline hover:border-highlight"
                >
                  {topic.name}
                </a>
              </li>
            ))}
          </ul>
        </Band>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Wire the route**

`src/app/page.tsx`:

```tsx
import { FrontPageView } from "@/components/FrontPageView";
import { StockShell } from "@/components/StockShell";
import { assembleFrontPage } from "@/content/frontpage";
import { loadContent } from "@/content/load";

export default function Page() {
  const { entries, projects } = loadContent();
  const page = assembleFrontPage(entries, projects);
  return (
    <StockShell stock="wire">
      <FrontPageView page={page} now={new Date()} />
    </StockShell>
  );
}
```

- [ ] **Step 6: Run the tests and the build**

```bash
npx vitest run tests/components/frontpage-view.test.tsx
npm run build
```

Expected: 7 tests PASS; build succeeds; `out/index.html` contains `data-band="lead"` once content exists — at this point it will contain the empty state, which is correct.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: front page route assembled by volume, with a rail built from what exists"
```

---

### Task 9: Index routes

Every index is the same component with different content, which is why the sparse rule lives in one place instead of six.

**Files:**
- Create: `src/components/IndexList.tsx`
- Create: `src/app/essays/page.tsx`, `src/app/notes/page.tsx`, `src/app/watch/page.tsx`, `src/app/archive/page.tsx`, `src/app/projects/page.tsx`, `src/app/topics/page.tsx`, `src/app/topics/[slug]/page.tsx`
- Create: `tests/components/index-list.test.tsx`

**Interfaces:**
- Consumes: `Entry`, `Project`, `TOPICS`, `loadContent`, `topicsInUse`, `Card`.
- Produces: `IndexList({ title, intro?, items, emptyLabel, now })`. With fewer than three items it renders full-width rows; at three or more it renders a grid.

- [ ] **Step 1: Write the failing test**

`tests/components/index-list.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { IndexList } from "@/components/IndexList";
import { entries } from "../helpers/fixtures";

const NOW = new Date("2026-10-19T12:00:00Z");

describe("IndexList", () => {
  it("uses full-width rows below three items", () => {
    const { container } = render(<IndexList title="Notes" items={entries(2)} emptyLabel="Nothing yet." now={NOW} />);
    expect(container.querySelector('[data-layout="rows"]')).toBeTruthy();
    expect(container.querySelector('[data-layout="grid"]')).toBeNull();
  });

  it("switches to a grid at three items", () => {
    const { container } = render(<IndexList title="Notes" items={entries(3)} emptyLabel="Nothing yet." now={NOW} />);
    expect(container.querySelector('[data-layout="grid"]')).toBeTruthy();
  });

  it("renders the empty label only when there is nothing", () => {
    const { container } = render(<IndexList title="Watch" items={[]} emptyLabel="Nothing yet." now={NOW} />);
    expect(container.textContent).toContain("Nothing yet.");
  });

  it("does not render the empty label when there are items", () => {
    const { container } = render(<IndexList title="Notes" items={entries(1)} emptyLabel="Nothing yet." now={NOW} />);
    expect(container.textContent).not.toContain("Nothing yet.");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/components/index-list.test.tsx`
Expected: FAIL — cannot resolve `@/components/IndexList`.

- [ ] **Step 3: Write the index component**

`src/components/IndexList.tsx`:

```tsx
import type { Entry } from "@/content/load";
import { Card } from "./Card";

/** The sparse rule lives here once: below three items a grid would be half empty,
 *  so the index prints rows. At three or more, it is a grid. */
export function IndexList({
  title,
  intro,
  items,
  emptyLabel,
  now,
}: {
  title: string;
  intro?: string;
  items: Entry[];
  emptyLabel: string;
  now: Date;
}) {
  const dense = items.length >= 3;

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="m-0 font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight">{title}</h1>
      {intro && <p className="measure mt-3 font-display text-lg text-muted-foreground">{intro}</p>}

      {items.length === 0 ? (
        <p className="mt-8 font-display text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div
          data-layout={dense ? "grid" : "rows"}
          className={
            dense
              ? "mt-8 grid gap-10 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-3"
              : "mt-8 flex flex-col gap-10 border-t border-border pt-8"
          }
        >
          {items.map((entry) => (
            <Card key={entry.slug} entry={entry} size={dense ? "card" : "row"} now={now} />
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Write the routes**

`src/app/essays/page.tsx`:

```tsx
import { IndexList } from "@/components/IndexList";
import { StockShell } from "@/components/StockShell";
import { loadContent } from "@/content/load";

export const metadata = { title: "Essays" };

export default function Page() {
  const { entries } = loadContent();
  return (
    <StockShell stock="wire">
      <IndexList
        title="Essays"
        intro="Longer pieces about local AI, the things I build, and what holds up."
        items={entries.filter((entry) => entry.kind === "essay")}
        emptyLabel="No essays yet."
        now={new Date()}
      />
    </StockShell>
  );
}
```

`src/app/notes/page.tsx`:

```tsx
import { IndexList } from "@/components/IndexList";
import { StockShell } from "@/components/StockShell";
import { loadContent } from "@/content/load";

export const metadata = { title: "Notes" };

export default function Page() {
  const { entries } = loadContent();
  return (
    <StockShell stock="wire">
      <IndexList
        title="Notes"
        intro="Short items and links, several a week."
        items={entries.filter((entry) => entry.kind === "note" || entry.kind === "link")}
        emptyLabel="No notes yet."
        now={new Date()}
      />
    </StockShell>
  );
}
```

`src/app/watch/page.tsx`:

```tsx
import { IndexList } from "@/components/IndexList";
import { StockShell } from "@/components/StockShell";
import { loadContent } from "@/content/load";

export const metadata = { title: "Watch" };

export default function Page() {
  const { entries } = loadContent();
  return (
    <StockShell stock="wire">
      <IndexList
        title="Watch"
        intro="Videos worth your time, with a line on why."
        items={entries.filter((entry) => entry.kind === "video")}
        emptyLabel="Nothing on the shelf yet."
        now={new Date()}
      />
    </StockShell>
  );
}
```

`src/app/archive/page.tsx`:

```tsx
import { IndexList } from "@/components/IndexList";
import { StockShell } from "@/components/StockShell";
import { loadContent } from "@/content/load";

export const metadata = { title: "Archive" };

export default function Page() {
  const { entries } = loadContent();
  return (
    <StockShell stock="wire">
      <IndexList title="Archive" items={entries} emptyLabel="Nothing published yet." now={new Date()} />
    </StockShell>
  );
}
```

`src/app/topics/page.tsx`:

```tsx
import Link from "next/link";
import { StockShell } from "@/components/StockShell";
import { topicsInUse } from "@/content/frontpage";
import { loadContent } from "@/content/load";

export const metadata = { title: "Topics" };

export default function Page() {
  const { entries, projects } = loadContent();
  const topics = topicsInUse(entries, projects);

  return (
    <StockShell stock="wire">
      <section className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="m-0 font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight">Topics</h1>
        {topics.length === 0 ? (
          <p className="mt-8 font-display text-muted-foreground">No topics in use yet.</p>
        ) : (
          <ul className="mt-8 flex list-none flex-col gap-6 border-t border-border p-0 pt-8">
            {topics.map((topic) => (
              <li key={topic.slug}>
                <h2 className="m-0 font-display text-2xl font-semibold">
                  <Link href={`/topics/${topic.slug}/`} className="no-underline hover:underline">{topic.name}</Link>
                </h2>
                <p className="measure m-0 mt-1 text-muted-foreground">{topic.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </StockShell>
  );
}
```

`src/app/topics/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { IndexList } from "@/components/IndexList";
import { StockShell } from "@/components/StockShell";
import { topicsInUse } from "@/content/frontpage";
import { loadContent } from "@/content/load";
import { TOPICS } from "@/content/schema";

export function generateStaticParams() {
  const { entries, projects } = loadContent();
  return topicsInUse(entries, projects).map((topic) => ({ slug: topic.slug }));
}

/* `params` is a Promise in the App Router this project targets — verified in
   Task 1, Step 1. If the installed version disagrees, follow the docs. */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = TOPICS.find((item) => item.slug === slug);
  if (!topic) notFound();

  const { entries, projects } = loadContent();
  const tagged = [
    ...entries.filter((entry) => entry.topics?.includes(slug)),
  ];
  const taggedProjects = projects.filter((project) => project.topics?.includes(slug));

  return (
    <StockShell stock="wire">
      <IndexList
        title={topic.name}
        intro={topic.description}
        items={tagged}
        emptyLabel="Nothing filed under this topic yet."
        now={new Date()}
      />
      {taggedProjects.length > 0 && (
        <section className="mx-auto max-w-6xl border-t border-border px-5 py-8">
          <h2 className="m-0 mb-4 font-display text-xl font-semibold">Projects</h2>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {taggedProjects.map((project) => (
              <li key={project.slug}>
                <a href={`/projects/${project.slug}/`} className="no-underline hover:underline">{project.title}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </StockShell>
  );
}
```

`src/app/projects/page.tsx`:

```tsx
import Link from "next/link";
import { StockShell } from "@/components/StockShell";
import { loadProjects } from "@/content/load";

export const metadata = { title: "Projects" };

export default function Page() {
  const projects = loadProjects();

  return (
    <StockShell stock="wire">
      <section className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="m-0 font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight">Projects</h1>
        <p className="measure mt-3 font-display text-lg text-muted-foreground">
          Things I have built and shipped, with what they are and what happened.
        </p>
        {projects.length === 0 ? (
          <p className="mt-8 font-display text-muted-foreground">Nothing here yet.</p>
        ) : (
          <ul className="mt-8 grid list-none gap-8 border-t border-border p-0 pt-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <li key={project.slug} className="flex flex-col gap-2">
                <p className="record m-0 text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">
                  {project.status} · {project.year}
                </p>
                <h2 className="m-0 font-display text-xl font-semibold">
                  <Link href={`/projects/${project.slug}/`} className="no-underline hover:underline">{project.title}</Link>
                </h2>
                <p className="m-0 text-sm text-muted-foreground">{project.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </StockShell>
  );
}
```

- [ ] **Step 5: Run the tests and build**

```bash
npx vitest run tests/components/index-list.test.tsx
npm run build
for r in essays notes watch archive projects topics; do test -f "out/$r/index.html" && echo "$r OK" || echo "$r MISSING"; done
```

Expected: tests PASS; all six route directories exist.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: index routes with one shared sparse-state rule"
```

---

### Task 10: Item pages on the reading stock

One article component renders all four kinds, because a note, a link and a video differ only in a header line and one embed. This is the only place the site crosses from wire to reading stock.

**Files:**
- Create: `src/components/Article.tsx`, `src/components/VideoEmbed.tsx`, `src/components/ProjectArticle.tsx`
- Create: `src/app/essays/[slug]/page.tsx`, `src/app/notes/[slug]/page.tsx`, `src/app/watch/[slug]/page.tsx`, `src/app/projects/[slug]/page.tsx`
- Create: `tests/components/article.test.tsx`

**Interfaces:**
- Consumes: `Entry`, `Project`, `renderMarkdown`, `Prose`, `StockShell`, `formatWhen`.
- Produces: `Article({ entry, html, now })`; `VideoEmbed({ id, title, channel, url })`; `ProjectArticle({ project, html })`; `videoIdOf(entry): string | null`.

- [ ] **Step 1: Write the failing test**

`tests/components/article.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Article } from "@/components/Article";
import { VideoEmbed } from "@/components/VideoEmbed";
import { entry } from "../helpers/fixtures";

const NOW = new Date("2026-10-19T12:00:00Z");

describe("Article", () => {
  it("renders the title, byline and body html", () => {
    const { container } = render(
      <Article entry={entry({ kind: "essay", title: "On-device", slug: "x" })} html="<p>Body text.</p>" now={NOW} />,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("On-device");
    expect(container.querySelector("article")?.innerHTML).toContain("Body text.");
  });

  it("links a link item out to its source", () => {
    render(
      <Article
        entry={entry({ kind: "link", title: "Worth reading", url: "https://x.test/a", source: "The Verge", slug: "l" })}
        html=""
        now={NOW}
      />,
    );
    const link = screen.getByRole("link", { name: /The Verge/ });
    expect(link.getAttribute("href")).toBe("https://x.test/a");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("embeds a video without autoplay", () => {
    const { container } = render(
      <Article
        entry={entry({ kind: "video", title: "A talk", video_id: "abc123", channel: "Some Channel", slug: "v" })}
        html=""
        now={NOW}
      />,
    );
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toBe("https://www.youtube-nocookie.com/embed/abc123");
    expect(iframe?.getAttribute("loading")).toBe("lazy");
    expect(iframe?.getAttribute("src")).not.toContain("autoplay");
  });
});

describe("VideoEmbed", () => {
  it("always offers a text link to the source", () => {
    render(<VideoEmbed id="abc123" title="A talk" channel="Some Channel" url="https://youtube.com/watch?v=abc123" />);
    expect(screen.getByRole("link", { name: /Watch on YouTube/ }).getAttribute("href"))
      .toBe("https://youtube.com/watch?v=abc123");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/components/article.test.tsx`
Expected: FAIL — components cannot be resolved.

- [ ] **Step 3: Write the embed and the article**

`src/components/VideoEmbed.tsx`:

```tsx
/** `youtube-nocookie`, no autoplay, lazy, and a text link, because a reader who
 *  does not want an embed should never be forced through one. */
export function VideoEmbed({
  id,
  title,
  channel,
  url,
}: {
  id: string;
  title: string;
  channel: string;
  url: string;
}) {
  return (
    <figure className="my-8">
      <div className="aspect-video w-full border border-border">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          loading="lazy"
          className="h-full w-full"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <figcaption className="record mt-2 flex items-baseline justify-between gap-4 text-[0.6875rem] text-muted-foreground">
        <span>{channel}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
          Watch on YouTube
        </a>
      </figcaption>
    </figure>
  );
}
```

`src/components/Article.tsx`:

```tsx
import type { Entry } from "@/content/load";
import { formatWhen } from "@/lib/format";
import { KindTag } from "./KindTag";
import { Prose } from "./Prose";
import { VideoEmbed } from "./VideoEmbed";

export function videoIdOf(entry: Entry): string | null {
  if (entry.video_id) return entry.video_id;
  if (!entry.video_url) return null;
  const match = entry.video_url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return match ? match[1] : null;
}

export function Article({ entry, html, now }: { entry: Entry; html: string; now: Date }) {
  const videoId = entry.kind === "video" ? videoIdOf(entry) : null;

  return (
    <article className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-baseline gap-3">
        <KindTag kind={entry.kind} />
        <time className="record text-[0.6875rem] text-muted-foreground" dateTime={entry.date}>
          {formatWhen(`${entry.date}T12:00:00Z`, now)}
        </time>
        {entry.updated && (
          <span className="record text-[0.6875rem] text-muted-foreground">
            · Updated {formatWhen(`${entry.updated}T12:00:00Z`, now)}
          </span>
        )}
      </div>

      <h1 className="mt-4 mb-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.08] tracking-tight">
        {entry.title}
      </h1>

      {entry.summary && (
        <p className="measure m-0 mb-6 font-display text-xl leading-relaxed text-muted-foreground">
          {entry.summary}
        </p>
      )}

      {entry.kind === "link" && entry.url && (
        <p className="record mb-6 text-sm text-muted-foreground">
          <a href={entry.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            {entry.source ?? new URL(entry.url).hostname}
          </a>
          {entry.url && <span> · {new URL(entry.url).hostname}</span>}
        </p>
      )}

      {videoId && (
        <VideoEmbed
          id={videoId}
          title={entry.title}
          channel={entry.channel ?? ""}
          url={entry.url ?? entry.video_url ?? `https://www.youtube.com/watch?v=${videoId}`}
        />
      )}

      <div className="measure">
        <Prose html={html} />
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Write the four item routes**

`src/app/essays/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { StockShell } from "@/components/StockShell";
import { loadEntries } from "@/content/load";
import { renderMarkdown } from "@/content/render";

export function generateStaticParams() {
  return loadEntries().filter((entry) => entry.kind === "essay").map((entry) => ({ slug: entry.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = loadEntries().find((item) => item.kind === "essay" && item.slug === slug);
  if (!entry) notFound();

  return (
    <StockShell stock="reading">
      <Article entry={entry} html={await renderMarkdown(entry.body)} now={new Date()} />
    </StockShell>
  );
}
```

`src/app/notes/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { StockShell } from "@/components/StockShell";
import { loadEntries } from "@/content/load";
import { renderMarkdown } from "@/content/render";

const KINDS = ["note", "link"] as const;

export function generateStaticParams() {
  return loadEntries()
    .filter((entry) => KINDS.includes(entry.kind as never))
    .map((entry) => ({ slug: entry.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = loadEntries().find(
    (item) => KINDS.includes(item.kind as never) && item.slug === slug,
  );
  if (!entry) notFound();

  return (
    <StockShell stock="reading">
      <Article entry={entry} html={await renderMarkdown(entry.body)} now={new Date()} />
    </StockShell>
  );
}
```

`src/app/watch/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { StockShell } from "@/components/StockShell";
import { loadEntries } from "@/content/load";
import { renderMarkdown } from "@/content/render";

export function generateStaticParams() {
  return loadEntries().filter((entry) => entry.kind === "video").map((entry) => ({ slug: entry.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = loadEntries().find((item) => item.kind === "video" && item.slug === slug);
  if (!entry) notFound();

  return (
    <StockShell stock="reading">
      <Article entry={entry} html={await renderMarkdown(entry.body)} now={new Date()} />
    </StockShell>
  );
}
```

`src/app/projects/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { StockShell } from "@/components/StockShell";
import { Prose } from "@/components/Prose";
import { loadContent } from "@/content/load";
import { renderMarkdown } from "@/content/render";

export function generateStaticParams() {
  return loadContent().projects.map((project) => ({ slug: project.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { entries, projects } = loadContent();
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const updates = entries.filter((entry) => entry.project === project.slug);

  return (
    <StockShell stock="reading">
      <article className="mx-auto max-w-3xl px-5 py-10">
        <p className="record m-0 text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">
          {project.status} · {project.year}
          {project.role ? ` · ${project.role}` : ""}
        </p>
        <h1 className="mt-3 mb-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.08] tracking-tight">
          {project.title}
        </h1>
        <p className="measure m-0 mb-6 font-display text-xl leading-relaxed text-muted-foreground">
          {project.summary}
        </p>

        {project.links && project.links.length > 0 && (
          <ul className="m-0 mb-8 flex list-none flex-wrap gap-3 p-0">
            {project.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-control border border-border px-3 py-1.5 font-ui text-sm no-underline hover:border-highlight"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="measure">
          <Prose html={await renderMarkdown(project.body)} />
        </div>

        {updates.length > 0 && (
          <section className="mt-12 border-t border-border pt-6">
            <h2 className="m-0 mb-3 font-display text-xl font-semibold">Updates</h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {updates.map((entry) => (
                <li key={entry.slug}>
                  <a href={`/essays/${entry.slug}/`} className="no-underline hover:underline">{entry.title}</a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </StockShell>
  );
}
```

> **Note for the implementer:** `ProjectArticle.tsx` is not needed — the project route is self-contained above. Do not create it. (It appeared in this task's file list before the code was written; the route replaced it.)

- [ ] **Step 5: Run the tests and build**

```bash
npx vitest run tests/components/article.test.tsx
npm run build
```

Expected: 4 tests PASS; build succeeds. Item routes exist only once `content/` has matching files, which Task 15 seeds.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: item pages on the reading stock, with a lazy video embed"
```

---

### Task 11: The `new` scripts

This is the feature the site lives or dies by. A note must be one command and one line.

**Files:**
- Create: `scripts/new.ts`, `scripts/check.ts`
- Modify: `package.json`
- Create: `tests/scripts/new.test.ts`

**Interfaces:**
- Consumes: `validateEntry` (so a scaffold that would fail the build is caught immediately).
- Produces: `slugify(text): string`; `scaffold(kind, arg, opts): { filename: string; contents: string }`; `parseOg(html): { title?, site?, image? }`; `fetchOg(url): Promise<{ title?, site?, image? }>`; `youtubeId(url): string | null`.

- [ ] **Step 1: Write the failing test**

`tests/scripts/new.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { fetchOg, parseOg, scaffold, slugify, youtubeId } from "../../scripts/new";

describe("slugify", () => {
  it("makes a url-safe slug", () => {
    expect(slugify("On-device inference: what changed?")).toBe("on-device-inference-what-changed");
  });
});

describe("scaffold", () => {
  const opts = { date: "2026-10-19", body: "Body." };

  it("scaffolds an essay with valid frontmatter", () => {
    const { filename, contents } = scaffold("essay", "On-device inference", opts);
    expect(filename).toBe("2026-10-19-on-device-inference.md");
    expect(contents).toContain("kind: essay");
    expect(contents).toContain('title: "On-device inference"');
    expect(contents).toContain("summary:");
  });

  it("scaffolds a note with no title, so the body becomes the headline", () => {
    const { contents } = scaffold("note", "First sentence. Second.", opts);
    expect(contents).not.toContain("title:");
    expect(contents).toContain("kind: note");
  });

  it("scaffolds a link with url and source", () => {
    const { contents } = scaffold("link", "https://x.test/a", {
      ...opts,
      url: "https://x.test/a",
      title: "Worth reading",
      site: "X",
    });
    expect(contents).toContain("kind: link");
    expect(contents).toContain("url: \"https://x.test/a\"");
    expect(contents).toContain("source: \"X\"");
  });

  it("scaffolds a video with id and channel", () => {
    const { contents } = scaffold("video", "https://youtube.com/watch?v=abc123", {
      ...opts,
      video_id: "abc123",
      channel: "Some Channel",
      title: "A talk",
    });
    expect(contents).toContain("kind: video");
    expect(contents).toContain("video_id: \"abc123\"");
    expect(contents).toContain('channel: "Some Channel"');
  });
});

describe("youtubeId", () => {
  it("reads every common youtube url shape", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=abc123")).toBe("abc123");
    expect(youtubeId("https://youtu.be/abc123")).toBe("abc123");
    expect(youtubeId("https://www.youtube.com/embed/abc123")).toBe("abc123");
    expect(youtubeId("https://example.com/not-video")).toBeNull();
  });
});

describe("parseOg", () => {
  it("reads og tags", () => {
    const html = `<meta property="og:title" content="A title"><meta property="og:site_name" content="The Verge"><meta property="og:image" content="https://x.test/i.png">`;
    expect(parseOg(html)).toEqual({ title: "A title", site: "The Verge", image: "https://x.test/i.png" });
  });

  it("falls back to the <title> tag and survives a page with no og tags", () => {
    expect(parseOg("<title>Plain title</title>").title).toBe("Plain title");
    expect(parseOg("<html></html>")).toEqual({});
  });
});

describe("fetchOg", () => {
  it("returns an empty object instead of throwing when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(fetchOg("https://x.test/a")).resolves.toEqual({});
    vi.unstubAllGlobals();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/scripts/new.test.ts`
Expected: FAIL — cannot resolve `../../scripts/new`.

- [ ] **Step 3: Write the script**

`scripts/new.ts`:

```ts
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Kind } from "../src/content/schema";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function youtubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return match ? match[1] : null;
}

const quote = (value: string) => JSON.stringify(value);

export interface ScaffoldOptions {
  date: string;
  body?: string;
  title?: string;
  site?: string;
  image?: string;
  url?: string;
  video_id?: string;
  channel?: string;
}

export function scaffold(kind: Kind, arg: string, options: ScaffoldOptions) {
  const title = options.title ?? arg;
  const slug = slugify(kind === "link" ? title : arg) || "untitled";
  const lines: string[] = ["---", `kind: ${kind}`];

  if (kind !== "note") lines.push(`title: ${quote(title)}`);
  lines.push(
    `summary: ${quote("TODO: one or two sentences that earn the click.")}`,
  );

  if (kind === "link") {
    lines.push(`url: ${quote(options.url ?? arg)}`);
    lines.push(`source: ${quote(options.site ?? new URL(options.url ?? arg).hostname)}`);
    if (options.image) lines.push(`image: ${quote(options.image)}`);
  }

  if (kind === "video") {
    lines.push(`video_id: ${quote(options.video_id ?? youtubeId(arg) ?? "")}`);
    lines.push(`channel: ${quote(options.channel ?? "Unknown channel")}`);
  }

  lines.push("topics: []", "---", "");

  const body = options.body ?? (kind === "note" ? arg : "Write here.");
  return {
    filename: `${options.date}-${slug}.md`,
    contents: `${lines.join("\n")}${body}\n`,
  };
}

export function parseOg(html: string): { title?: string; site?: string; image?: string } {
  const meta = (property: string) => {
    const match = html.match(
      new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    );
    return match?.[1];
  };

  const title =
    meta("og:title") ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();

  return {
    ...(title ? { title } : {}),
    ...(meta("og:site_name") ? { site: meta("og:site_name") } : {}),
    ...(meta("og:image") ? { image: meta("og:image") } : {}),
  };
}

export async function fetchOg(url: string) {
  try {
    const response = await fetch(url, { headers: { "user-agent": "getdibs/1.0" } });
    if (!response.ok) return {};
    return parseOg(await response.text());
  } catch {
    return {};
  }
}

async function main() {
  const [kindArg, arg] = process.argv.slice(2);
  const kind = kindArg as Kind;
  if (!kindArg || !arg) {
    console.error("usage: npm run new <essay|note|link|video> <title|text|url>");
    process.exit(1);
  }

  const date = new Date().toISOString().slice(0, 10);
  const extra: ScaffoldOptions = { date };

  if (kind === "link") {
    Object.assign(extra, await fetchOg(arg), { url: arg });
    if (!extra.title) extra.title = new URL(arg).hostname;
  }

  if (kind === "video") {
    const id = youtubeId(arg);
    extra.video_id = id ?? undefined;
    try {
      const response = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(arg)}`);
      if (response.ok) {
        const data = (await response.json()) as { title?: string; author_name?: string };
        extra.title = data.title;
        extra.channel = data.author_name;
      }
    } catch {
      /* oEmbed is a convenience. A missing title is a prompt, not a failure. */
    }
  }

  const { filename, contents } = scaffold(kind, arg, extra);
  const dir = "content/entries";
  mkdirSync(dir, { recursive: true });
  const path = join(dir, filename);
  if (existsSync(path)) {
    console.error(`${path} already exists`);
    process.exit(1);
  }

  writeFileSync(path, contents);
  console.log(path);
}

if (process.argv[1]?.endsWith("new.ts")) {
  await main();
}
```

`scripts/check.ts`:

```ts
import { ContentError } from "../src/content/validate";
import { loadContent } from "../src/content/load";

try {
  const { entries, projects } = loadContent();
  console.log(`ok — ${entries.length} entries, ${projects.length} projects`);
} catch (error) {
  if (error instanceof ContentError) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}
```

Update `package.json` scripts:

```json
"new": "tsx scripts/new.ts"
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/scripts/new.test.ts`
Expected: PASS — 10 tests.

- [ ] **Step 5: Prove the scripts work end to end**

```bash
npm run new note "Trying the new scripts. This should be one command." 
npm run check
cat content/entries/*.md
rm content/entries/*.md
```

Expected: `ok — 1 entries, 0 projects`; the scaffolded file has `kind: note`, no `title`, and the note text as its body. Delete it afterwards so it does not pollute Task 15's seed.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: new-item scripts, with OG and oEmbed prefill that degrade quietly"
```

---

### Task 12: Machine-readable outputs

Four files, one script, one mechanism. The script is pure up to the last step, so the XML and the listing are asserted directly.

**Files:**
- Create: `scripts/build-feeds.ts`
- Create: `tests/scripts/feeds.test.ts`
- Create: `tests/content/routes.test.ts`

**Interfaces:**
- Consumes: `Entry`, `Project`, `Topic`, `SITE`, `entryPath`, `projectPath`, `topicPath` (all from Task 7's `routes.ts`).
- Produces: `escapeXml`, `buildRss`, `buildJsonFeed`, `buildLlms`, `buildSitemap`, `buildAll(root?): Record<string, string>`.

- [ ] **Step 1: Write the failing tests**

`tests/content/routes.test.ts`:

```ts
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
```

`tests/scripts/feeds.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildJsonFeed, buildLlms, buildRss, buildSitemap, escapeXml } from "../../scripts/build-feeds";
import { TOPICS } from "@/content/schema";
import { entries, entry, project } from "../helpers/fixtures";

const NOW = new Date("2026-10-19T12:00:00Z");
const live = [entry({ kind: "essay", slug: "one", title: "One & Two", summary: "A <summary>", date: "2026-10-19" })];

describe("escapeXml", () => {
  it("escapes the five characters that break XML", () => {
    expect(escapeXml(`a & b < c > d " e ' f`)).toBe("a &amp; b &lt; c &gt; d &quot; e &apos; f");
  });
});

describe("buildRss", () => {
  it("is a well-formed channel with one item per entry", () => {
    const rss = buildRss(live, NOW);
    expect(rss.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(rss).toContain("<title>DIBS</title>");
    expect(rss.match(/<item>/g)).toHaveLength(1);
    expect(rss).toContain("<link>https://getdibs.io/essays/one/</link>");
    expect(rss).toContain("One &amp; Two");
    expect(rss).toContain("A &lt;summary&gt;");
  });

  it("carries a pubDate in RFC 822", () => {
    expect(buildRss(live, NOW)).toContain("<pubDate>Mon, 19 Oct 2026 12:00:00 GMT</pubDate>");
  });

  it("is empty but valid with no entries", () => {
    const rss = buildRss([], NOW);
    expect(rss).toContain("<channel>");
    expect(rss).not.toContain("<item>");
  });
});

describe("buildJsonFeed", () => {
  it("names the feed and every published item", () => {
    const feed = JSON.parse(buildJsonFeed(live, NOW));
    expect(feed.version).toBe("https://jsonfeed.org/version/1.1");
    expect(feed.items).toHaveLength(1);
    expect(feed.items[0].url).toBe("https://getdibs.io/essays/one/");
  });
});

describe("buildSitemap", () => {
  it("lists every surface, including item and topic routes", () => {
    const sitemap = buildSitemap([...live, ...entries(2)], [project({ slug: "manifest" })], TOPICS);
    for (const path of ["/", "/essays/", "/notes/", "/watch/", "/projects/", "/topics/", "/archive/",
                        "/about/", "/subscribe/", "/essays/one/", "/projects/manifest/", "/topics/local-ai/"]) {
      expect(sitemap).toContain(`<loc>https://getdibs.io${path}</loc>`);
    }
  });
});

describe("buildLlms", () => {
  it("lists the essays, notes and projects as text", () => {
    const llms = buildLlms(live, [project({ slug: "manifest", title: "Manifest" })], TOPICS);
    expect(llms).toContain("# DIBS");
    expect(llms).toContain("One & Two");
    expect(llms).toContain("Manifest");
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run tests/content/routes.test.ts tests/scripts/feeds.test.ts`
Expected: FAIL — modules cannot be resolved.

- [ ] **Step 3: Confirm the shared route map is the only copy**

`src/content/routes.ts` already exists from Task 7, and `Card`, `Lead`, `og.ts` and this script all import it. Before writing the script, confirm nothing re-declares it:

```bash
grep -rn "essays\": \"essays\"\|essay: \"essays\"" src/ || echo "one copy only"
```

Expected: `one copy only`. If anything re-declares the map, delete the copy and import instead — a second map is how a link and its feed entry drift apart.

- [ ] **Step 4: Write the build script**

`scripts/build-feeds.ts`:

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { topicsInUse } from "../src/content/frontpage";
import type { Entry, Project } from "../src/content/load";
import { loadContent } from "../src/content/load";
import { entryPath, projectPath, topicPath } from "../src/content/routes";
import type { Topic } from "../src/content/schema";
import { SITE } from "../src/lib/site";

export const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const absolute = (path: string) => `${SITE.url}${path}`;
const published = (entry: Entry) => new Date(`${entry.date}T12:00:00Z`).toUTCString();

export function buildRss(entries: Entry[], now: Date): string {
  const items = entries
    .map(
      (entry) => `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${absolute(entryPath(entry))}</link>
      <guid isPermaLink="true">${absolute(entryPath(entry))}</guid>
      <pubDate>${published(entry)}</pubDate>
      <description>${escapeXml(entry.summary)}</description>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${SITE.url}/</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

export function buildJsonFeed(entries: Entry[], now: Date): string {
  return JSON.stringify(
    {
      version: "https://jsonfeed.org/version/1.1",
      title: SITE.name,
      home_page_url: `${SITE.url}/`,
      feed_url: `${SITE.url}/feed.json`,
      description: SITE.description,
      items: entries.map((entry) => ({
        id: absolute(entryPath(entry)),
        url: absolute(entryPath(entry)),
        title: entry.title,
        summary: entry.summary,
        date_published: `${entry.date}T12:00:00Z`,
        tags: entry.topics ?? [],
      })),
    },
    null,
    2,
  );
}

export function buildLlms(entries: Entry[], projects: Project[], topics: Topic[]): string {
  const line = (title: string, href: string) => `- [${title}](${absolute(href)})`;
  const section = (heading: string, rows: string[]) =>
    rows.length === 0 ? "" : `\n## ${heading}\n\n${rows.join("\n")}\n`;

  return `# ${SITE.name}

> ${SITE.description}

Everything on this site is written by ${SITE.author}. Essays are long-form, notes
are short, and the watch shelf is curated rather than exhaustive.

${section("Essays", entries.filter((e) => e.kind === "essay").map((e) => line(e.title, entryPath(e))))}${section(
    "Notes and links",
    entries.filter((e) => e.kind === "note" || e.kind === "link").map((e) => line(e.title, entryPath(e))),
  )}${section("Watch", entries.filter((e) => e.kind === "video").map((e) => line(e.title, entryPath(e))))}${section(
    "Projects",
    projects.map((p) => line(p.title, projectPath(p))),
  )}${section("Topics", topics.map((t) => `${line(t.name, topicPath(t.slug))} — ${t.description}`))}`;
}

export function buildSitemap(entries: Entry[], projects: Project[], topics: Topic[]): string {
  const paths = [
    "/", "/essays/", "/notes/", "/watch/", "/projects/", "/topics/", "/archive/", "/about/", "/subscribe/",
    ...entries.map(entryPath),
    ...projects.map(projectPath),
    ...topics.map((topic) => topicPath(topic.slug)),
  ];

  const urls = paths
    .map((path) => `  <url>\n    <loc>${absolute(path)}</loc>\n  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/** Everything written into public/ at build time. Returned rather than written so
 *  the tests can assert the strings without touching the filesystem. */
export function buildAll(root = "content"): Record<string, string> {
  const { entries, projects } = loadContent(root);
  const topics = topicsInUse(entries, projects);
  const now = new Date();

  return {
    "feed.xml": buildRss(entries, now),
    "feed.json": buildJsonFeed(entries, now),
    "llms.txt": buildLlms(entries, projects, topics),
    "sitemap.xml": buildSitemap(entries, projects, topics),
  };
}

function main() {
  mkdirSync("public", { recursive: true });
  for (const [name, contents] of Object.entries(buildAll())) {
    writeFileSync(join("public", name), contents);
    console.log(`wrote public/${name}`);
  }
}

if (process.argv[1]?.endsWith("build-feeds.ts")) main();
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run tests/content/routes.test.ts tests/scripts/feeds.test.ts`
Expected: PASS — 10 tests.

- [ ] **Step 6: Build and inspect the output**

```bash
npm run build
head -20 out/feed.xml
grep -c "<url>" out/sitemap.xml
head -20 out/llms.txt
```

Expected: valid XML with a channel, a sitemap with one `<url>` per surface, and a readable `llms.txt`.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: RSS, JSON feed, sitemap and llms.txt from one build script"
```

---

### Task 13: Link previews, analytics, and the last static pages

**Files:**
- Create: `src/lib/og.ts`, `src/components/Analytics.tsx`
- Create: `src/app/about/page.tsx`, `src/app/subscribe/page.tsx`, `src/app/not-found.tsx`
- Modify: the four item routes (add `generateMetadata`)
- Create: `tests/lib/og.test.ts`, `tests/components/analytics.test.tsx`

**Interfaces:**
- Consumes: `Entry`, `Project`, `SITE`.
- Produces: `itemMetadata(entry): Metadata`; `projectMetadata(project): Metadata`; `Analytics()`.

- [ ] **Step 1: Write the failing tests**

`tests/lib/og.test.ts`:

```ts
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
```

`tests/components/analytics.test.tsx`:

```tsx
// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Analytics } from "@/components/Analytics";

afterEach(() => {
  delete process.env.NEXT_PUBLIC_CF_BEACON;
});

describe("Analytics", () => {
  it("renders nothing when no beacon token is configured", () => {
    const { container } = render(<Analytics />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the Cloudflare beacon when configured", () => {
    process.env.NEXT_PUBLIC_CF_BEACON = "abc";
    const { container } = render(<Analytics />);
    expect(container.querySelector("script")?.getAttribute("data-cf-beacon")).toContain("abc");
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run tests/lib/og.test.ts tests/components/analytics.test.tsx`
Expected: FAIL — modules cannot be resolved.

- [ ] **Step 3: Write the metadata helper**

`src/lib/og.ts`:

```ts
import type { Metadata } from "next";
import type { Entry, Project } from "@/content/load";
import { entryPath, projectPath } from "@/content/routes";
import { SITE } from "./site";

export function itemMetadata(entry: Entry): Metadata {
  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: `${SITE.url}${entryPath(entry)}` },
    openGraph: {
      type: "article",
      title: entry.title,
      description: entry.summary,
      url: `${SITE.url}${entryPath(entry)}`,
      publishedTime: entry.date,
      ...(entry.updated ? { modifiedTime: entry.updated } : {}),
      /* No cover, no image. A text-only preview is honest; a generated one would
         need a font binary and a rasteriser in the build (see the plan's
         amendments). */
      ...(entry.cover ? { images: [{ url: entry.cover }] } : {}),
    },
  };
}

export function projectMetadata(project: Project): Metadata {
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `${SITE.url}${projectPath(project)}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary,
      url: `${SITE.url}${projectPath(project)}`,
      ...(project.cover ? { images: [{ url: project.cover }] } : {}),
    },
  };
}
```

- [ ] **Step 4: Add `generateMetadata` to the four item routes**

In each route, add the import and the export (shown here for `src/app/essays/[slug]/page.tsx`; repeat verbatim in `notes`, `watch` and `projects`, swapping `itemMetadata(entry)` for `projectMetadata(project)` in the projects route):

```tsx
import { itemMetadata } from "@/lib/og";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = loadEntries().find((item) => item.kind === "essay" && item.slug === slug);
  return entry ? itemMetadata(entry) : {};
}
```

In `src/app/projects/[slug]/page.tsx` the same shape returns `projectMetadata(project)`.

- [ ] **Step 5: Write analytics**

`src/components/Analytics.tsx`:

```tsx
/** Cloudflare Web Analytics: no cookies, therefore no consent banner. The token is
 *  a build-time environment value; when it is absent the component renders nothing
 *  rather than a broken script tag. */
export function Analytics() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON;
  if (!token) return null;

  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
```

Add `<Analytics />` as the last child of `<body>` in `src/app/layout.tsx`:

```tsx
import { Analytics } from "@/components/Analytics";
...
<body data-stock="wire">
  {children}
  <Analytics />
</body>
```

- [ ] **Step 6: Write the last three static pages**

`src/app/about/page.tsx`:

```tsx
import { StockShell } from "@/components/StockShell";
import { SITE } from "@/lib/site";

export const metadata = { title: "About" };

export default function Page() {
  return (
    <StockShell stock="reading">
      <article className="measure mx-auto px-5 py-10">
        <h1 className="m-0 font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold tracking-tight">
          About
        </h1>
        <p className="mt-6 font-display text-lg leading-relaxed">
          I build things and write down what I learn. Most of it is about AI that
          runs on hardware you own, and about products taken from idea to shipped.
        </p>
        <p className="font-display text-lg leading-relaxed">
          This is my personal site. {SITE.name} is where the writing lives; the
          products are elsewhere.
        </p>
        <p className="font-display text-lg leading-relaxed">
          The fastest way to follow along is the <a href="/feed.xml" className="underline underline-offset-4">RSS feed</a>.
        </p>
      </article>
    </StockShell>
  );
}
```

`src/app/subscribe/page.tsx`:

```tsx
import { StockShell } from "@/components/StockShell";

export const metadata = { title: "Subscribe" };

/* The list lives wherever it lives. This page points at it and does not pretend
   to own it — see spec §3, non-goals. */
export default function Page() {
  return (
    <StockShell stock="reading">
      <article className="measure mx-auto px-5 py-10">
        <h1 className="m-0 font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold tracking-tight">
          Subscribe
        </h1>
        <p className="mt-6 font-display text-lg leading-relaxed">
          The site has an <a href="/feed.xml" className="underline underline-offset-4">RSS feed</a>,
          which is the subscription that always works. An email list is coming; when
          it exists, the link will be here and nowhere else.
        </p>
      </article>
    </StockShell>
  );
}
```

`src/app/not-found.tsx`:

```tsx
import Link from "next/link";
import { StockShell } from "@/components/StockShell";

export default function NotFound() {
  return (
    <StockShell stock="wire">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <p className="record m-0 text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">404</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">That page isn't here.</h1>
        <p className="mt-4 font-display text-muted-foreground">
          It may have moved, or it may never have existed. The <Link href="/" className="underline underline-offset-4">front page</Link> is a better bet.
        </p>
      </div>
    </StockShell>
  );
}
```

- [ ] **Step 7: Run the tests and build**

```bash
npx vitest run
npm run build
test -f out/about/index.html && test -f out/subscribe/index.html && test -f out/404.html && echo "STATIC PAGES OK"
```

Expected: all tests PASS; all three pages exist. (`not-found.tsx` exports to `out/404.html` under static export; if the installed version names it differently, follow the docs.)

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: honest link previews, optional analytics, about/subscribe/404"
```

---

### Task 14: Prove the accessibility claims

The spec commits to WCAG AA on **both** stocks. Contrast is the part people eyeball and get wrong, so it is computed here, from the shipped CSS, not asserted in prose.

**Files:**
- Create: `tests/design/contrast.test.ts`
- Create: `tests/design/a11y.test.tsx`

**Interfaces:**
- Consumes: `readTokenScopes`, `READING`, `WIRE` (Task 2); `StockShell`; `IndexList`.
- Produces: no source changes unless a pair fails.

- [ ] **Step 1: Write the failing contrast test**

`tests/design/contrast.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { READING, WIRE, readTokenScopes } from "../helpers/tokens";

function hslToRgb(hue: number, sat: number, light: number): [number, number, number] {
  const h = ((hue % 360) + 360) % 360 / 360;
  const s = sat / 100;
  const l = light / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;

  let rgb: [number, number, number];
  if (h < 1 / 6) rgb = [c, x, 0];
  else if (h < 2 / 6) rgb = [x, c, 0];
  else if (h < 3 / 6) rgb = [0, c, x];
  else if (h < 4 / 6) rgb = [0, x, c];
  else if (h < 5 / 6) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return [rgb[0] + m, rgb[1] + m, rgb[2] + m];
}

const channel = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

const luminance = ([r, g, b]: [number, number, number]) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

function parse(token: string): [number, number, number] {
  const [h, s, l] = token.trim().split(/\s+/).map(Number);
  return hslToRgb(h, s, l);
}

function ratio(foreground: string, background: string): number {
  const a = luminance(parse(foreground));
  const b = luminance(parse(background));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/* Every pair that carries text. `highlight` is deliberately absent: it is a
   decorative rule colour and never a text colour on either stock. */
const PAIRS = [
  ["foreground", "background"],
  ["muted-foreground", "background"],
  ["card-foreground", "card"],
  ["foreground", "secondary"],
  ["primary-foreground", "primary"],
] as const;

for (const scope of [READING, WIRE]) {
  describe(`contrast on ${scope}`, () => {
    const tokens = readTokenScopes()[scope];

    for (const [fg, bg] of PAIRS) {
      it(`${fg} on ${bg} is at least 4.5:1`, () => {
        expect(tokens?.[fg]).toBeDefined();
        expect(tokens?.[bg]).toBeDefined();
        expect(ratio(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
      });
    }

    it("uses --highlight only as decoration, never as a text token", () => {
      const textRoles = ["foreground", "muted-foreground", "card-foreground", "primary-foreground"];
      for (const role of textRoles) {
        expect(tokens?.[role]).not.toBe(tokens?.highlight);
      }
    });
  });
}
```

- [ ] **Step 2: Write the failing structural test**

`tests/design/a11y.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StockShell } from "@/components/StockShell";
import { IndexList } from "@/components/IndexList";
import { entries } from "../helpers/fixtures";

const NOW = new Date("2026-10-19T12:00:00Z");

describe("structure", () => {
  it("offers a skip link on every stock", () => {
    render(<StockShell stock="wire"><p>content</p></StockShell>);
    expect(screen.getByRole("link", { name: /skip to content/i }).getAttribute("href")).toBe("#main");
  });

  it("gives every page exactly one h1", () => {
    const { container } = render(
      <IndexList title="Notes" items={entries(4)} emptyLabel="None." now={NOW} />,
    );
    expect(container.querySelectorAll("h1")).toHaveLength(1);
  });

  it("labels the main landmark", () => {
    const { container } = render(<StockShell stock="reading"><p>content</p></StockShell>);
    expect(container.querySelector("main#main")).toBeTruthy();
  });

  it("uses a time element for dates", () => {
    const { container } = render(
      <IndexList title="Notes" items={entries(1)} emptyLabel="None." now={NOW} />,
    );
    expect(container.querySelector("time")?.getAttribute("datetime")).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run both to see where you actually stand**

Run: `npx vitest run tests/design`
Expected: the structural tests PASS. If a contrast pair FAILS, **do not change the token values** — they are ported from Depalo and shared with that site. Change the *pairing* (do not use that token for text at that size), note it in the task report, and raise it as a question. The likely candidate is `muted-foreground` on `secondary` in one stock; that pairing is not in the list above for exactly this reason.

- [ ] **Step 4: Record the result in the README**

Create `README.md`:

```markdown
# getdibs.io

A personal publication. Markdown in `content/`, static HTML out.

## Writing

```bash
npm run new essay "Title"          # long-form
npm run new note "One line."       # short item; the text becomes the headline
npm run new link https://…         # pulls the page's OG tags
npm run new video https://youtu.be/…   # pulls title and channel
```

Then write, and push. Drafts are `draft: true` — excluded from the build, the
feeds and the sitemap until you remove it.

## Running

```bash
npm run dev      # local
npm test         # content and design rules
npm run check    # frontmatter only, no build
npm run build    # writes public/{feed.xml,feed.json,llms.txt,sitemap.xml}, then exports to out/
```

## The two stocks

The wire is dark and used for every list. The reading stock is light and used for
every single item. There is no toggle: the surface follows the task, not a
preference. Tokens live in `src/app/globals.css` and are ported verbatim from
depaloconsultingllc.com.
```

- [ ] **Step 5: Full suite, then commit**

```bash
npx vitest run
git add -A && git commit -m "test: compute WCAG AA contrast on both stocks; assert page structure"
```

---

### Task 15: Ship it, and seed it honestly

**Files:**
- Create: `wrangler.toml`, `public/_headers`, `README.md` (if absent)
- Modify: `.gitignore`
- Create: `content/entries/*.md` (7 seeds), `content/projects/*.md` (2 seeds)

**Interfaces:**
- Consumes: everything.
- Produces: a live site at `https://getdibs.io` with every band rendering.

- [ ] **Step 1: Keep generated files out of git**

Append to `.gitignore`:

```
public/feed.xml
public/feed.json
public/llms.txt
public/sitemap.xml
```

- [ ] **Step 2: Add the Pages config and headers**

`wrangler.toml`:

```toml
name = "getdibs"
compatibility_date = "2026-10-19"
pages_build_output_dir = "out"
```

`public/_headers`:

```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/*.xml
  Cache-Control: public, max-age=3600
```

- [ ] **Step 3: Seed enough real content that no band is a lie**

Seven entries and two projects. Together they light the lead, the bunks, the feed, the Watch band (3 videos), the Projects band (2) and the Topics band (2 topics in use). Every file below is real prose you should replace — but replacing it later is editing, not building. **The three `video_id` values are placeholders; swap them for the videos you actually want before launch**, or the shelf embeds a video you did not choose.

`content/entries/2026-10-19-what-this-is.md`:

```markdown
---
kind: essay
title: "What this is"
summary: "A personal publication about local AI and the things I build. Here is what to expect, and what will not be here."
topics: ["building"]
---

I build things and write down what I learn. Most of it is about AI that runs on
hardware you own, and about taking a product from an idea to something people can
install.

This site is where the writing lives. It is not a company site, not a résumé, and
not a newsletter funnel. If that changes, this paragraph will change first.

## What to expect

Essays when there is something worth arguing. Notes when there is not. A watch
shelf of videos worth your time, with a line on why. Projects when something
ships.

## What not to expect

No breaking-news coverage. No launch-day reactions. Nothing written to fill a
calendar.
```

`content/entries/2026-10-18-local-models-got-good.md`:

```markdown
---
kind: note
summary: "A seven-billion-parameter model on a laptop now beats what cost a GPU two years ago."
topics: ["local-ai"]
---

Local models got good enough to stop being a compromise. The thing on my laptop
today is better than what I was paying for in 2024, and it does not need a
network connection to answer.
```

`content/entries/2026-10-17-the-quiet-part.md`:

```markdown
---
kind: note
summary: "The interesting part of on-device AI is not the model. It is what you can promise because the data never leaves."
topics: ["local-ai"]
---

The interesting part of on-device AI is not the model. It is what you can promise
a customer because the data never leaves the machine.
```

`content/entries/2026-10-16-a-link.md`:

```markdown
---
kind: link
title: "The case for boring infrastructure"
summary: "Worth reading if you have ever inherited a system nobody can explain."
url: "https://example.com/boring-infrastructure"
source: "Example"
topics: ["building"]
---

Good argument, and it holds for AI too: the model is the least interesting part
of the system.
```

`content/entries/2026-10-15-on-device-demo.md`:

```markdown
---
kind: video
title: "On-device inference, demonstrated"
summary: "A model answering questions over a folder of documents with the network off."
video_id: "dQw4w9WgXcQ"
channel: "Example Channel"
topics: ["local-ai"]
---

Turn the network off first. That is the whole demo.
```

`content/entries/2026-10-14-weekend-build.md`:

```markdown
---
kind: video
title: "A weekend build, start to finish"
summary: "Four hours of work compressed into twelve minutes, including the parts that failed."
video_id: "dQw4w9WgXcQ"
channel: "Example Channel"
topics: ["building"]
---

The failures are the interesting half.
```

`content/entries/2026-10-13-what-i-got-wrong.md`:

```markdown
---
kind: video
title: "What I got wrong about local AI"
summary: "Three assumptions that did not survive contact with real users."
video_id: "dQw4w9WgXcQ"
channel: "Example Channel"
topics: ["local-ai"]
---

Assumption two was the expensive one.
```

`content/projects/manifest.md`:

```markdown
---
title: "Manifest"
summary: "A hardware asset register that runs on the machine it describes."
status: "shipped"
year: "2026"
role: "Design and engineering"
stack: ["Swift", "SwiftUI", "on-device models"]
topics: ["building", "local-ai"]
links:
  - label: "App Store"
    url: "https://apps.apple.com/"
---

Built because the alternative was renting a register that could not answer a
question without a network connection.
```

`content/projects/studio.md`:

```markdown
---
title: "Studio"
summary: "A privacy toolkit: archives, documents, passwords, all on-device."
status: "shipped"
year: "2026"
role: "Design and engineering"
stack: ["Swift", "Windows", "local models"]
topics: ["local-ai"]
links:
  - label: "Mac App Store"
    url: "https://apps.apple.com/"
  - label: "Microsoft Store"
    url: "https://apps.microsoft.com/"
---

The rule for every tool in it: the file does not leave the machine.
```

- [ ] **Step 4: Verify the seeded site locally**

```bash
npm run check
npm run build
npx serve out
```

Expected: `ok — 7 entries, 2 projects`. Then in the served site:

1. `/` shows a lead, three bunks, a feed with the rail, and Watch / Projects / Topics bands.
2. `/notes/` shows rows (it has three items, so it shows a grid — confirm the rule flips at three).
3. `/essays/what-this-is/` is on the light stock; `/` is on the dark one.
4. `/watch/on-device-demo/` embeds without autoplay and links to YouTube.
5. `/feed.xml` parses, `/llms.txt` reads sensibly.

- [ ] **Step 5: Create the repo and deploy**

```bash
git add -A && git commit -m "content: seed seven entries and two projects so every band is honest"
gh repo create getdibs --private --source=. --push
npx wrangler pages project create getdibs --production-branch main
npx wrangler pages deploy out --project-name getdibs
```

Set the Pages environment variable `NODE_VERSION=22` and, when analytics is live,
`NEXT_PUBLIC_CF_BEACON`. Build command `npm run build`, output directory `out`.

- [ ] **Step 6: Point getdibs.io at it**

In Cloudflare → Workers & Pages → `getdibs` → Custom domains: add `getdibs.io` and `www.getdibs.io`, with `www` redirecting to the apex. Because the domain's DNS is already on Cloudflare, this creates the records; do not hand-create a CNAME that will conflict with them.

- [ ] **Step 7: Verify production, not the build log**

```bash
curl -sI https://getdibs.io | head -5
curl -s https://getdibs.io/ | grep -c 'data-band' 
curl -s https://getdibs.io/feed.xml | head -3
curl -s https://getdibs.io/sitemap.xml | grep -c '<url>'
```

Expected: `200`; at least six band attributes on the front page; a valid RSS header; six or more sitemap URLs (ten surfaces plus items and topics).

- [ ] **Step 8: Final commit**

```bash
git add -A && git commit -m "chore: wrangler config, headers, and deployment notes"
```

---

## Self-review

Run this against the spec before declaring the plan done.

**1. Spec coverage**

| Spec section | Task |
|---|---|
| §1 purpose, §2 success criteria | 6, 8, 9, 14 (criteria 2 and 3 asserted by tests) |
| §3 non-goals | Enforced by absence; no search, no toggle, no comments appear in any task |
| §4 information architecture | 9, 10, 13 |
| §5 content model, §5.3 validation | 3, 4 |
| §6 front page, minimums, lead, plates, time | 6, 7, 8 |
| §7 identity, tokens, stocks, type, masthead | 2, 14 |
| §8 build and deploy | 1, 15 |
| §9 publishing mechanics | 11 |
| §10 feeds and previews | 12, 13 (image generation cut, see amendments) |
| §11 analytics | 13 |
| §12 accessibility | 2, 8, 14 |
| §13 verification | tests throughout; volumes 1–30 in 6; static export check in 1, 9, 13, 15 |
| §14 risks | Addressed inline; OG risk resolved by cutting it |
| §15 milestones | 1–2 = skeleton, 3–5 = pipeline, 6–10 = surfaces, 11–13 = distribution, 14–15 = finish |

**2. Placeholder scan**

Run this and fix anything it finds:

```bash
grep -nE "TBD|TODO|implement later|fill in|similar to Task [0-9]|appropriate error handling" docs/superpowers/plans/2026-10-19-getdibs-implementation.md
```

The only permitted hit in *shipped content* is the `summary` prompt that `scripts/new.ts` writes into a scaffolded file — that is a message to the author, not a gap in the plan. The review section itself prints the search pattern, so it matches too; that is expected. Any other hit is a plan failure.

**3. Type consistency**

- `Entry.title` is non-optional everywhere after loading; `EntryFrontmatter.title` is optional. Task 4 is the only conversion point.
- `entryPath` / `projectPath` / `topicPath` are defined once, in Task 7's `src/content/routes.ts`, and imported by `Card`, `Lead`, `og.ts` and the feeds. No module keeps a second kind→section map; Task 12 Step 3 asserts this.
- `FrontPage`'s assembled branch is narrowed with `Extract<FrontPage, { state: "assembled" }>` in `Rail`, which is the same type `FrontPageView` checks for.
- `params` is `Promise<{ slug: string }>` in every dynamic route — the App Router convention this plan was written against, and Task 1 Step 1 exists to confirm or correct it.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-19-getdibs-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** — a fresh subagent per task, with review between tasks. Fast iteration, and each task gets a clean context.

**2. Inline Execution** — run the tasks in this session with `executing-plans`, batching with checkpoints for review.

Which approach?

