import { StockShell } from "@/components/StockShell";

export default function Page() {
  return (
    <StockShell stock="reading">
      <div className="measure mx-auto px-5 py-16">
        <h1 className="font-display text-4xl font-semibold">About</h1>
      </div>
    </StockShell>
  );
}
