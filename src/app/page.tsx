import { StockShell } from "@/components/StockShell";

export default function Page() {
  return (
    <StockShell stock="wire">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="font-display text-5xl font-semibold tracking-tight">DIBS</h1>
      </div>
    </StockShell>
  );
}
