import { IndexList } from "@/components/IndexList";
import { SiteShell } from "@/components/SiteShell";
import { loadContent } from "@/content/load";

export const metadata = { title: "Archive" };

export default function Page() {
  const { entries } = loadContent();
  return (
    <SiteShell>
      <IndexList path="~/archive" title="Archive" intro="Everything published, newest first." items={entries} emptyLabel="Nothing published yet." now={new Date()} />
    </SiteShell>
  );
}
