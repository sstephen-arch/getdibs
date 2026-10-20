import { StockShell } from "@/components/StockShell";

export const metadata = { title: "Subscribe" };

/* The list lives wherever it lives. This page points at it and does not pretend
   to own it — see spec §3, non-goals. */
export default function Page() {
  return (
    <StockShell stock="reading">
      <article className="measure mx-auto px-5 py-10">
        <h1 className="m-0 font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold tracking-tight">
          Subscribe
        </h1>
        <p className="mt-6 font-display text-lg leading-relaxed">
          The site has an{" "}
          <a href="/feed.xml" className="underline underline-offset-4">RSS feed</a>, which is
          the subscription that always works. An email list is coming; when it
          exists, the link will be here and nowhere else.
        </p>
      </article>
    </StockShell>
  );
}
