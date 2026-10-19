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
