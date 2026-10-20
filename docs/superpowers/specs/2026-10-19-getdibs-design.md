# getdibs.io — Personal Publication

**Status:** design approved 2026-10-19, awaiting implementation plan
**Repo:** `~/Documents/getdibs` (new, standalone)
**Related sites:** `depaloconsultingllc.com` (design source of truth), `starkive.app` (unrelated — no shared design)

---

## 1. What this is

A personal publication at **getdibs.io**. The author is the product. The reader is **builders and practitioners** — people who want to use AI well and want to see things actually working. The beat is **local AI**, plus the author's own projects and shipped work.

It is not a résumé, not a company site, and not a blog with a big first post. It is a newsroom-shaped publication that a single author fills several times a week.

## 2. Success criteria

1. Publishing a short note takes **under one minute**, end to end, from terminal to live.
2. The front page reads as an *edited publication* whether it holds 5 items or 500.
3. No section ever renders as broken or empty — every list has a designed sparse state.
4. Long-form is comfortable to read; the feed is fast to scan.
5. A reader who arrives at any single item page understands whose site they are on and what else is here.

## 3. Non-goals for v1

Decided against, with reasons — not deferred by omission:

| Not building | Why |
|---|---|
| Comments | Conversation happens where the link is shared. Moderation would be a second job. |
| Light/dark toggle | There is one light stock (§7.1, amended 2026-10-20). A toggle would bring back the dark surface the owner chose to retire. |
| Search | Unnecessary at 20 items, necessary at 200. Phase 2, client-side, over generated JSON. |
| Newsletter capture | External service. `/subscribe` links out. RSS is the first-party subscription. |
| Multi-author | It is one author. `author` exists in frontmatter from day one so nothing needs migrating later. |
| Tag taxonomy beyond topics | A second taxonomy nobody maintains is debt. |
| Memberships, paywall, sponsored content | Out of character for v1. |

## 4. Information architecture

| Route | Purpose | Content | Stock |
|---|---|---|---|
| `/` | Front page | assembled from everything | wire |
| `/essays` | Long-form index | `kind: essay` | wire |
| `/essays/[slug]` | Essay | one entry | reading |
| `/notes` | The running log | `kind: note`, `kind: link` | wire |
| `/notes/[slug]` | Note or link | one entry | reading |
| `/watch` | Video shelf | `kind: video` | wire |
| `/watch/[slug]` | Shelf item | one entry | reading |
| `/projects` | Standing work, undated | `projects` | wire |
| `/projects/[slug]` | Project / case study | one project | reading |
| `/topics` | All desks | configured topics actually in use | wire |
| `/topics/[slug]` | A desk (first: `local-ai`) | any entry or project tagged with it | wire |
| `/about` | Who, what, how to reach | static | reading |
| `/subscribe` | Points at wherever the list lives | static | reading |
| `/archive` | Everything by date | all entries | wire |
| `/404` | Not found, no apologies | static | wire |

**`/essays` vs `/articles`:** `/essays` is chosen. It sets a bar and sounds like a person, not a content mill.

**`/notes` is load-bearing, not a duplicate of the front page.** At several items a week, there must be a place where *"one paragraph and a link"* is a finished, complete item, and where forty of them read as a body of work. Without it the fast path has no home and the author defaults to writing only essays.

**Topic slugs** are configured in `content/topics.ts` (slug → name + one-line description). Topic index pages are generated for every topic actually used in frontmatter; an unused topic generates nothing.

## 5. Content model

Markdown with frontmatter, in the repo, read and validated at build time. Two collections.

### 5.1 `content/entries/*.mdx` — everything dated

Discriminated by `kind`. Filename carries the date and slug: `2026-10-19-on-device-inference.mdx`.

**Common frontmatter (all kinds):**

| Field | Type | Notes |
|---|---|---|
| `kind` | `essay \| note \| link \| video` | required, discriminator |
| `date` | ISO date | optional; **defaults to the filename prefix**. Set it explicitly to override the filename. |
| `title` | string | required except for `note` |
| `summary` | string | 1–2 sentences. Used on cards, in meta description, in RSS. Required. |
| `topics` | string[] | optional; must match slugs in `content/topics.ts` |
| `author` | string | optional; defaults to the site owner. Exists from day one so multi-author never requires a migration. |
| `cover` | path | optional; absence triggers the plate (see §6.4) |
| `lead` | boolean | optional; forces this item as the front-page lead |
| `draft` | boolean | optional; excluded from build, RSS, sitemap and OG |
| `updated` | ISO date | optional; renders an "Updated <date>" marker |
| `project` | slug | optional; also appears on `/projects/<slug>` (see §5.2) |

**Per-kind additions:**

- `essay` — optional `video` (YouTube id). A video essay is an essay with an embed near the top, **not** a `kind: video`. This is why there is no `tier` field: tier is expressed by the kind itself.
- `note` — `title` optional. When absent, the card headline is derived from the **first sentence of the body, truncated to 160 characters**. This is what keeps a note to twenty seconds of work.
- `link` — required `url`; required `source` (publication name); optional `author`, `image` (both fetched from OG at creation time).
- `video` — required `video_id` or `video_url`; required `channel`; optional `duration`. Rendered as an embed plus one line of the author's own framing.

### 5.2 `content/projects/*.mdx` — standing, undated work

| Field | Type | Notes |
|---|---|---|
| `title` | string | required |
| `summary` | string | required |
| `status` | `shipped \| building \| archived` | required |
| `year` | string | required |
| `role` | string | optional |
| `stack` | string[] | optional |
| `links` | `{label, url}[]` | optional |
| `topics` | string[] | optional; must match slugs in `content/topics.ts` |
| `cover` | path | optional |

Projects are **not** dated and do **not** sort into the feed by their own presence. An entry with `project: <slug>` appears both in the main feed and on that project's page — so a shipped milestone lands on the front page and updates the case study in the same commit.

### 5.3 Validation

A single well-tested validator runs at build time and fails the build with a readable message naming the file and the field:

```
content/entries/2026-10-19-x.mdx: kind "video" requires "channel"
content/entries/2026-10-19-y.mdx: topic "local-aii" is not defined in content/topics.ts
```

**No schema library.** A hand-written validator with TypeScript types is roughly forty lines and one fewer dependency. This is a deliberate trade: the schema is small enough that a library is more machinery than the problem.

## 6. Front page composition

The page **assembles itself** from what exists. There is no `frontpage.yml` to maintain, because at several posts a week the thing that kills these sites is the per-publish edit. An optional override exists (`lead: true`) for when the author wants to control the top of the page.

### 6.1 Bands, in order

1. Masthead + primary nav
2. **Lead** — one full-width item (minimum: 1, always present)
3. **Bunks** — the next 2–4 items, mixed kinds, each labeled with its kind so a note never masquerades as an essay (minimum: 2)
4. **Feed + rail** — the river in the main column; a right rail carrying real content from other sections (minimum: 3 entries; below that the bunks *are* the feed)
5. **Bands** — Watch (minimum: 3), Projects (minimum: 2), Topics (minimum: 2 topics in use)

### 6.2 Minimum-count rule (the honesty rule)

A band renders **only if it has its minimum** — stated per band above. A band under its minimum waits. Consequences:

- Nothing ever renders a half-empty grid, an empty box, or a placeholder.
- If `/watch` is empty, the rail simply has no Watch block. No apology line.
- With three items total the page is lead + bunks and looks deliberate.

### 6.3 Lead selection

In order: `lead: true` → newest `essay` → newest entry of any kind. **Never empty.** The author can always override and never has to.

### 6.4 Cards, covers and plates

Every item has a cover, or a **typographic plate**: kicker (kind + topic), title, topic colour. No grey rectangles anywhere on the site. The plate component does double duty — it also renders the social preview image for items with no cover (§10).

### 6.5 Time

Relative for the first 48 hours (`3 hours ago`), absolute dates after (`12 March`). This is the newsroom convention and it is what stops a quiet fortnight reading as neglect: an item from March says `12 March`, not `4 months ago`.

## 7. Identity

Design source of truth is **depaloconsultingllc.com**. Tokens and type are ported, not reinvented. The framework is not ported: that site is SvelteKit, this one is Next.js.

### 7.1 One stock (amended 2026-10-20)

> **Amended 2026-10-20 by the owner.** The original rule split the site into a dark
> *wire* for index pages and a light *reading* stock for single items. In use, the
> dark wire made the site harder to read and did not look like Depalo. It is
> retired: **every page is Depalo's light paper-and-ink stock.** The `Stock` column
> in §4 is historical.

What replaced the wire's job of making lists feel different from reading:

- **Sections are numbered and ruled.** Every band opens with a mono eyebrow
  (`01 / LATEST`) and a hairline to the right edge, numbered from the bands that
  actually render, so the sparse rule (§6.2) never leaves a gap in the count.
- **Lists are white panels on paper.** Cards and log rows sit on `--card` with a
  border and a light shadow, as on Depalo's service grid; the page is `--background`.
- **The masthead is white, sticky and ruled**, and marks the current section.
- **Developer furniture is first class:** breadcrumbs as paths (`~ / essays / slug`),
  an "On this page" list on long items, a link from every item to its markdown
  source on GitHub, and a lead plate that shows the item's real frontmatter
  instead of repeating its title.

No toggle and no dark mode: `prefers-color-scheme` does not flip the surface.

**Cards are editorial, not links (amended 2026-10-20).** Every item shows as a
picture, a kicker (its desk, or "Worth reading" for a pointer to someone else's
work), the headline and the standfirst. Nothing in a card is styled as a
hyperlink: no link colour, no arrows, no tags; the whole card is the target and
the hover is a lift. Items carry a `cover` (with `cover_alt` and `cover_credit`);
without one, the image slot is a topic-colour panel with no text. The front-page
**rail is removed**: projects, watch and topics already have bands of their own,
so a rail only repeated them as bare links (§6.1 item 4 is now the feed alone).
A link item's way out is a "Source" box at the end of the page, not a button at
the top.

### 7.2 Tokens — ported verbatim

Token *names and values* are copied unchanged from Depalo's light `:root` into the token region of `globals.css`, so a change on either site is a copy-paste. HSL triplet convention, `hsl(var(--x))` at point of use.

**Light (the only stock since 2026-10-20):**

```
--background: 36 33% 97%      --foreground: 40 6% 10%
--card: 0 0% 100%             --card-foreground: 40 6% 10%
--popover: 0 0% 100%          --popover-foreground: 40 6% 10%
--primary: 224 75% 48%        --primary-foreground: 0 0% 100%
--secondary: 40 24% 93%       --secondary-foreground: 40 6% 10%
--muted: 40 24% 93%           --muted-foreground: 38 5% 40%
--accent: 40 24% 93%          --accent-foreground: 40 6% 10%
--destructive: 0 72% 51%      --destructive-foreground: 0 0% 98%
--border: 37 21% 88%          --input: 37 21% 88%   --ring: 224 75% 48%
--radius: .5rem
--highlight: 32 95% 44%       --live: 149 66% 30%
```

**Dark (wire) — retired 2026-10-20, kept for the record:**

```
--background: 40 7% 8%        --foreground: 40 27% 93%
--card: 30 7% 11%             --card-foreground: 40 27% 93%
--popover: 30 7% 11%          --popover-foreground: 40 27% 93%
--primary: 226 82% 72%        --primary-foreground: 222 55% 13%
--secondary: 34 8% 17%        --secondary-foreground: 40 27% 93%
--muted: 34 8% 17%            --muted-foreground: 39 7% 61%
--accent: 34 8% 17%           --accent-foreground: 40 27% 93%
--destructive: 0 72% 60%      --destructive-foreground: 0 0% 98%
--border: 34 8% 17%           --input: 34 8% 17%   --ring: 226 82% 72%
--highlight: 38 92% 58%       --live: 149 49% 49%
```

Depalo's `--chart-1…6` tokens are **not** ported: there are no charts here.

### 7.3 Typography

Ported from Depalo, unchanged:

- **Display and body:** Source Serif 4 — headlines, essay body. This is what holds the two stocks together as one site rather than two.
- **UI and kickers:** Inter — nav, buttons, labels, kind tags.
- **Records:** JetBrains Mono — bylines, timestamps, dates, slugs, anything that is a record rather than a sentence.

Loaded via `next/font/google` with `display: swap` and self-hosted subsets.

### 7.4 Masthead

**DIBS** as the wordmark, with `getdibs.io` set in JetBrains Mono beneath it like a newspaper dateline. The domain becomes part of the design rather than something to work around.

## 8. Build and deploy

- **Framework:** Next.js, App Router, TypeScript, Tailwind.
- **Rendering:** fully static — `output: 'export'` to `out/`. There is no database, no API route, no session, no ISR requirement. Nothing to fall over at runtime.
- **Host:** Cloudflare Pages, project `getdibs`, custom domain `getdibs.io`, `www` → apex redirect. `public/_headers` for caching. Same pattern as the existing Starkive deployment, minus the `next-on-pages` wrapper, which static export makes unnecessary.
- **Publishing flow:** write markdown → `git push` → Pages builds and deploys. Every post is a deploy.
- **Next.js version — do not repeat 15.3.3.** The existing project pins `next@15.3.3`, which npm currently marks *deprecated* with **CVE-2025-66478**. This repo installs a **patched release** and records the version in the plan.
- **Note on `AGENTS.md` (existing project):** that file instructs reading `node_modules/next/dist/docs/` before writing code, and asserts the installed Next is nonstandard. Neither holds: the directory does not exist, and the package resolves to the stock npm tarball. This spec does not depend on that instruction; the implementation plan must verify the chosen version's App Router and static-export conventions against its actual shipped docs before writing routes.

## 9. Publishing mechanics

This is the highest-value part of the build. At several items a week, the deciding factor is how long it takes to post a note.

| Command | Does |
|---|---|
| `npm run new essay "Title"` | creates `content/entries/<date>-<slug>.mdx` with valid frontmatter, opens it |
| `npm run new note "Text"` | same, minimal; body pre-filled from the argument |
| `npm run new link <url>` | **fetches the page's Open Graph tags**, pre-fills `title`, `source`, `author`, `image`; the author writes one line |
| `npm run new video <youtube-url>` | pulls title and channel via oEmbed; a shelf item is one command and one line |
| `npm run check` | runs frontmatter validation standalone; also runs on every build |

`draft: true` keeps an item out of the build, RSS, sitemap and OG generation while it is being written, but visible in `npm run dev`.

## 10. Metadata, feeds and previews

- `/feed.xml` — RSS, drafts excluded, full summary.
- `/sitemap.xml` and `/robots.txt` — generated at build from the actual content.
- `/llms.txt` plus a full-text JSON feed, so an agent reading getdibs.io gets structured writing rather than scraped HTML. Cheap, on-brand for the domain, and almost nobody has it.
- **Social previews:** items with a `cover` use it; items without use the same plate component rendered to an image at build time. One component, two outputs.
- Per-page canonical URLs, per-item meta descriptions from `summary`.

## 11. Analytics

Cloudflare Web Analytics. No cookies, therefore no consent banner. No third-party tag, no client-side script beyond the beacon.

## 12. Accessibility requirements

Non-negotiable, and verified rather than assumed:

- WCAG AA contrast on the stock — checked, not eyeballed.
- Semantic landmarks: one `h1` per page, `nav`/`main`/`article`/`aside`, skip-to-content link.
- Keyboard operable throughout, visible focus rings.
- `prefers-reduced-motion` respected for any scroll or reveal animation — the source site uses scroll-reveal, and the same courtesy applies here.
- Video embeds are lazy, are never autoplay, and carry a text link to the source.
- Timestamps use `<time datetime>`.

## 13. Verification

- **Frontmatter:** build fails with a readable error on missing or invalid fields; a test asserts each failure mode.
- **Sparse states:** render the front page, `/watch`, `/projects` and `/topics/*` against fixtures of **1, 2, 3 and 30** items and assert that no band renders under its minimum and no empty box appears.
- **Lead selection:** tested for all three cases (explicit `lead`, newest essay, newest any).
- **Note headline derivation:** tested for the no-title case, including a body with no full stop.
- **Contrast:** AA verified programmatically.
- **Static export:** `out/` contains every route; no route returns an error; content pages ship minimal JS.
- **Feeds:** RSS validates; sitemap contains exactly the published routes and no drafts.
- **OG fetch:** `new link` handles a page with no OG tags without crashing.

## 14. Open questions and risks

| Risk | Handling |
|---|---|
| Build-time OG image generation adds a dependency (Satori/resvg). | It is the **first thing cut** if scope bites; the fallback is one site-wide preview image. Cards still render plates either way, so the site never looks unfinished. |
| A note's permalink is a destination, so reading stock — but a stream of short items may want to stay wire. | Rule applied as specified (§7.1). Revisit only with real content to look at. |
| Newsletter service not chosen. | `/subscribe` is a static page pointing at a URL until one is. |
| `output: 'export'` means no server-side forms. | Accepted; there are no forms in v1 except the newsletter link. |
| Ported tokens drift from Depalo over time. | Same names and values in one file per repo; a change on either side is a copy-paste, and the file is small enough to diff by eye. |

## 15. Milestones

1. **Skeleton** — repo, Next.js + Tailwind, tokens, type, masthead, the two stocks as a layout shell.
2. **Content pipeline** — validator, markdown reading, entries and projects collections, the `new` scripts.
3. **Surfaces** — front page with bands and min-count rule, indexes, item pages, topic pages, sparse states.
4. **Distribution** — RSS, sitemap, robots, `llms.txt`, JSON feed, OG plates, analytics.
5. **Finish** — accessibility and contrast verification, static export check, deploy to Pages, point `getdibs.io`, seed with the first real items.

Each milestone ends with something viewable, not a layer of plumbing.
