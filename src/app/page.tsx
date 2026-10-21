import { FrontPageView } from "@/components/FrontPageView";
import { SiteShell } from "@/components/SiteShell";
import { assembleFrontPage } from "@/content/frontpage";
import { loadContent } from "@/content/load";

export default function Page() {
  const { entries, projects } = loadContent();
  const page = assembleFrontPage(entries, projects);
  const kinds = (kind: string) => entries.filter((entry) => entry.kind === kind).length;
  const count = (value: number, one: string, many: string) => ({ value, label: value === 1 ? one : many });
  const counts = [
    count(kinds("essay"), "essay", "essays"),
    count(kinds("video"), "video worth watching", "videos worth watching"),
    count(projects.length, "project", "projects"),
    count(page.state === "assembled" ? page.topics.length : 0, "topic", "topics"),
  ];
  return (
    <SiteShell>
      <FrontPageView page={page} now={new Date()} counts={counts} />
    </SiteShell>
  );
}
