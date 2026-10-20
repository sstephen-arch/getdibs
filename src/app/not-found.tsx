import Link from "next/link";
import { StockShell } from "@/components/StockShell";

export default function NotFound() {
  return (
    <StockShell stock="wire">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <p className="record m-0 text-[0.6875rem] uppercase tracking-[0.13em] text-muted-foreground">404</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">That page isn&apos;t here.</h1>
        <p className="mt-4 font-display text-muted-foreground">
          It may have moved, or it may never have existed. The{" "}
          <Link href="/" className="underline underline-offset-4">front page</Link> is a better bet.
        </p>
      </div>
    </StockShell>
  );
}
