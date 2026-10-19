import { IndexList } from "@/components/IndexList";
import { StockShell } from "@/components/StockShell";
import { loadContent } from "@/content/load";

export const metadata = { title: "Notes" };

export default function Page() {
  const { entries } = loadContent();
  return (
    <StockShell stock="wire">
      <IndexList
        title="Notes"
        intro="Short items and links, several a week."
        items={entries.filter((entry) => entry.kind === "note" || entry.kind === "link")}
        emptyLabel="No notes yet."
        now={new Date()}
      />
    </StockShell>
  );
}
