import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { SiteShell } from "@/components/SiteShell";
import { loadEntries } from "@/content/load";
import { renderMarkdown } from "@/content/render";
import { placeholderSlug } from "@/content/routes";
import { itemMetadata } from "@/lib/og";

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
  return entry ? itemMetadata(entry) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = findVideo(slug);
  if (!entry) notFound();

  return (
    <SiteShell section="watch">
      <Article entry={entry} html={await renderMarkdown(entry.body)} now={new Date()} />
    </SiteShell>
  );
}
