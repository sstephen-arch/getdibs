import Link from "next/link";
import { StockShell } from "@/components/StockShell";
import { topicsInUse } from "@/content/frontpage";
import { loadContent } from "@/content/load";
import { topicPath } from "@/content/routes";

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
                  <Link href={topicPath(topic.slug)} className="no-underline hover:underline">{topic.name}</Link>
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
