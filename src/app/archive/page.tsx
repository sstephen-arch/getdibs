import { IndexList } from "@/components/IndexList";
import { StockShell } from "@/components/StockShell";
import { loadContent } from "@/content/load";

export const metadata = { title: "Archive" };

export default function Page() {
  const { entries } = loadContent();
  return (
    <StockShell stock="wire">
      <IndexList title="Archive" items={entries} emptyLabel="Nothing published yet." now={new Date()} />
    </StockShell>
  );
}
