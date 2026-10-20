import { IndexList } from "@/components/IndexList";
import { SiteShell } from "@/components/SiteShell";
import { loadContent } from "@/content/load";

export const metadata = { title: "Essays" };

export default function Page() {
  const { entries } = loadContent();
  return (
    <SiteShell section="essays">
      <IndexList
        path="~/essays"
        title="Essays"
        intro="Longer pieces about local AI, the things I build, and what holds up."
        items={entries.filter((entry) => entry.kind === "essay")}
        emptyLabel="No essays yet."
        now={new Date()}
      />
    </SiteShell>
  );
}
