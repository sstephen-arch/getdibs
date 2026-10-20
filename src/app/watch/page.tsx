import { IndexList } from "@/components/IndexList";
import { SiteShell } from "@/components/SiteShell";
import { loadContent } from "@/content/load";

export const metadata = { title: "Watch" };

export default function Page() {
  const { entries } = loadContent();
  return (
    <SiteShell section="watch">
      <IndexList
        path="~/watch"
        title="Watch"
        intro="Videos worth your time, with a line on why."
        items={entries.filter((entry) => entry.kind === "video")}
        emptyLabel="Nothing on the shelf yet."
        now={new Date()}
      />
    </SiteShell>
  );
}
