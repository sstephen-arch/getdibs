import { SiteShell } from "@/components/SiteShell";
import { SITE } from "@/lib/site";

export const metadata = { title: "About" };

export default function Page() {
  return (
    <SiteShell>
      <article className="measure mx-auto px-5 py-12">
        <p className="eyebrow m-0 mb-3">~/about</p>
        <h1 className="m-0 font-display text-[clamp(2.25rem,5.5vw,3.75rem)] font-bold leading-[0.98] tracking-[-0.04em]">
          About
        </h1>
        <p className="mt-6 font-display text-lg leading-relaxed">
          I build things and write down what I learn. Most of it is about AI that
          runs on hardware you own, and about products taken from idea to shipped.
        </p>
        <p className="mt-4 font-display text-lg leading-relaxed">
          This is my personal site. {SITE.name} is where the writing lives; the
          products are elsewhere.
        </p>
        <p className="mt-4 font-display text-lg leading-relaxed">
          The fastest way to follow along is the{" "}
          <a href="/feed.xml" className="text-primary underline underline-offset-4">RSS feed</a>.
        </p>
      </article>
    </SiteShell>
  );
}
