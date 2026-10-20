import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

/** The slice of a hast node this module touches. Typed locally so the renderer
 *  does not import a transitive dependency for one interface. */
interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

/** Wraps every table in `<div class="table-scroll">`, so a wide table scrolls
 *  inside the article rather than pushing the page sideways on a phone. */
function rehypeTableScroll() {
  const wrap = (node: HastNode) => {
    if (!node.children) return;
    node.children = node.children.map((child) => {
      if (child.type === "element" && child.tagName === "table") {
        return {
          type: "element",
          tagName: "div",
          properties: { className: ["table-scroll"] },
          children: [child],
        };
      }
      wrap(child);
      return child;
    });
  };
  return (tree: HastNode) => wrap(tree);
}

/** The only place markdown syntax is understood. If MDX is adopted later, it is
 *  adopted here and nowhere else. */
export async function renderMarkdown(body: string): Promise<string> {
  const file = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeTableScroll)
    .use(rehypeStringify)
    .process(body);

  return String(file);
}

export interface Heading {
  id: string;
  text: string;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", "#x27": "'" };

/** The second-level headings of rendered HTML, in order, for an "On this page"
 *  list. Read from the output rather than the markdown so the ids are exactly
 *  the ones rehype-slug wrote. */
export function headingsOf(html: string): Heading[] {
  return [...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map(([, id, inner]) => ({
    id,
    text: inner
      .replace(/<[^>]+>/g, "")
      .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, name: string) => {
        const key = name.toLowerCase();
        if (ENTITIES[key]) return ENTITIES[key];
        if (key.startsWith("#x")) return String.fromCodePoint(parseInt(key.slice(2), 16));
        if (key.startsWith("#")) return String.fromCodePoint(parseInt(key.slice(1), 10));
        return match;
      })
      .trim(),
  }));
}
