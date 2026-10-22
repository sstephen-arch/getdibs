import { SiteShell } from "@/components/SiteShell";

export const metadata = { title: "Subscribe" };

/* The list lives wherever it lives. This page points at it and does not pretend
   to own it — see spec §3, non-goals. */
export default function Page() {
  return (
    <SiteShell>
      <article className="measure mx-auto px-5 py-12">
        <p className="eyebrow m-0 mb-3">~/subscribe</p>
        <h1 className="m-0 font-display text-[clamp(2.25rem,5.5vw,3.75rem)] font-bold leading-[0.98] tracking-[-0.04em]">
          Subscribe
        </h1>
        <p className="mt-6 font-display text-lg leading-relaxed">
          The site has an{" "}
          <a href="/feed.xml" className="text-primary underline underline-offset-4">RSS feed</a>, which is
          the subscription that always works. An email list is coming; when it
          exists, the link will be here and nowhere else.
        </p>
      </article>
    </SiteShell>
  );
}
