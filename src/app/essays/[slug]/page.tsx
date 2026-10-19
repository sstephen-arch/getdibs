import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { StockShell } from "@/components/StockShell";
import { loadEntries } from "@/content/load";
import { renderMarkdown } from "@/content/render";
import { placeholderSlug } from "@/content/routes";

/* Static export has no runtime: only the slugs `generateStaticParams` lists are
   emitted, and anything else 404s. `dynamicParams = false` states that. */
export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = loadEntries().filter((entry) => entry.kind === "essay").map((entry) => ({ slug: entry.slug }));
  /* Next refuses a truly empty `generateStaticParams` under `output: export`.
     With no essays published, one placeholder path is emitted; the page 404s
     for it, so the route is ready for content without printing a fake article. */
  return slugs.length > 0 ? slugs : [{ slug: placeholderSlug("essays") }];
}

function findEssay(slug: string) {
  return loadEntries().find((item) => item.kind === "essay" && item.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = findEssay(slug);
  return entry ? { title: entry.title, description: entry.summary } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = findEssay(slug);
  if (!entry) notFound();

  return (
    <StockShell stock="reading">
      <Article entry={entry} html={await renderMarkdown(entry.body)} now={new Date()} />
    </StockShell>
  );
}
