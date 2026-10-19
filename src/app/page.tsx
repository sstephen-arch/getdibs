import { FrontPageView } from "@/components/FrontPageView";
import { StockShell } from "@/components/StockShell";
import { assembleFrontPage } from "@/content/frontpage";
import { loadContent } from "@/content/load";

export default function Page() {
  const { entries, projects } = loadContent();
  const page = assembleFrontPage(entries, projects);
  return (
    <StockShell stock="wire">
      <FrontPageView page={page} now={new Date()} />
    </StockShell>
  );
}
