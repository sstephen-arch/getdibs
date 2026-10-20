import { FrontPageView } from "@/components/FrontPageView";
import { SiteShell } from "@/components/SiteShell";
import { assembleFrontPage } from "@/content/frontpage";
import { loadContent } from "@/content/load";

export default function Page() {
  const { entries, projects } = loadContent();
  const page = assembleFrontPage(entries, projects);
  return (
    <SiteShell>
      <FrontPageView page={page} now={new Date()} />
    </SiteShell>
  );
}
