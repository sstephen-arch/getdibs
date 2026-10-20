import { StockShell } from "@/components/StockShell";
import { SITE } from "@/lib/site";

export const metadata = { title: "About" };

export default function Page() {
  return (
    <StockShell stock="reading">
      <article className="measure mx-auto px-5 py-10">
        <h1 className="m-0 font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold tracking-tight">
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
          <a href="/feed.xml" className="underline underline-offset-4">RSS feed</a>.
        </p>
      </article>
    </StockShell>
  );
}
