import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { StockShell } from "@/components/StockShell";
import { loadEntries } from "@/content/load";
import { renderMarkdown } from "@/content/render";
import { placeholderSlug } from "@/content/routes";

export const dynamicParams = false;

function findVideo(slug: string) {
  return loadEntries().find((item) => item.kind === "video" && item.slug === slug);
}

export function generateStaticParams() {
  const slugs = loadEntries().filter((entry) => entry.kind === "video").map((entry) => ({ slug: entry.slug }));
  return slugs.length > 0 ? slugs : [{ slug: placeholderSlug("watch") }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = findVideo(slug);
  return entry ? { title: entry.title, description: entry.summary } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = findVideo(slug);
  if (!entry) notFound();

  return (
    <StockShell stock="reading">
      <Article entry={entry} html={await renderMarkdown(entry.body)} now={new Date()} />
    </StockShell>
  );
}
