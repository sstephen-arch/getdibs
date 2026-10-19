import Link from "next/link";

export function Band({
  id,
  title,
  href,
  children,
}: {
  id: string;
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section data-band={id} className="border-t border-border py-8">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="m-0 font-display text-xl font-semibold">{title}</h2>
        <Link href={href} className="font-ui text-sm text-muted-foreground no-underline hover:text-foreground">
          All {title.toLowerCase()} →
        </Link>
      </div>
      {children}
    </section>
  );
}
