import { SectionHeader } from "./SectionHeader";

export function Band({
  id,
  index,
  title,
  href,
  children,
}: {
  id: string;
  index?: number;
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section data-band={id} className="py-10">
      <SectionHeader index={index} label={title} href={href} />
      {children}
    </section>
  );
}
