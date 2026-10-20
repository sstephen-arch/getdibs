import { Masthead, type Section } from "./Masthead";
import { Footer } from "./Footer";

/** Every page is one stock: Depalo's paper and ink. The dark wire that index pages
 *  used to sit on was retired on 2026-10-20, so the only thing a page tells the
 *  shell is which section it belongs to, and the masthead marks it. */
export function SiteShell({
  section,
  children,
}: {
  section?: Section;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-4 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Masthead section={section} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
