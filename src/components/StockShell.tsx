import { Masthead } from "./Masthead";
import { Footer } from "./Footer";

/** THE RULE, in one component: the wire (dark) is for anything the reader scans
 *  in a list; the reading stock (light) is for any single item they have opened.
 *  There is no colour-scheme toggle, so this prop is the only way a stock changes. */
export function StockShell({
  stock,
  children,
}: {
  stock: "wire" | "reading";
  children: React.ReactNode;
}) {
  return (
    <div
      data-stock={stock}
      className="min-h-dvh bg-background text-foreground flex flex-col"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-4 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Masthead />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
