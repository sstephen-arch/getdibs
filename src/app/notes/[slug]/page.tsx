import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { StockShell } from "@/components/StockShell";
import { loadEntries, type Entry } from "@/content/load";
import { renderMarkdown } from "@/content/render";
import { placeholderSlug } from "@/content/routes";
import { itemMetadata } from "@/lib/og";

const KINDS = ["note", "link"] as const;

export const dynamicParams = false;

function isNoteLike(entry: Entry): boolean {
  return KINDS.includes(entry.kind as never);
}

export function generateStaticParams() {
  const slugs = loadEntries()
    .filter(isNoteLike)
    .map((entry) => ({ slug: entry.slug }));
  return slugs.length > 0 ? slugs : [{ slug: placeholderSlug("notes") }];
}

function findNote(slug: string) {
  return loadEntries().find((item) => isNoteLike(item) && item.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = findNote(slug);
  return entry ? itemMetadata(entry) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = findNote(slug);
  if (!entry) notFound();

  return (
    <StockShell stock="reading">
      <Article entry={entry} html={await renderMarkdown(entry.body)} now={new Date()} />
    </StockShell>
  );
}
