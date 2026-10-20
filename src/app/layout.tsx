import type { Metadata } from "next";
import { Source_Serif_4, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { SITE } from "@/lib/site";
import "./globals.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
});

const ui = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* Most routes are index routes, so the wire is the site default. `StockShell`
       re-declares the stock per page; tokens resolve from the nearest ancestor. */
    <html lang="en" className={`${serif.variable} ${ui.variable} ${mono.variable}`}>
      <body data-stock="wire">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
