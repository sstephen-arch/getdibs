/*
 * Verified against the docs shipped with Next 16.4.2
 * (node_modules/next/dist/docs), Task 1, Step 1:
 *
 * 1. Static export is still `output: "export"`; it writes to `out/`.
 *    `trailingSlash: true` emits `/me/index.html` for `/me`.
 *    `images.unoptimized: true` is the supported config option for
 *    disabling the Image Optimization API (`app/.../components/image.md`).
 * 2. `params` in `page.tsx` is `Promise<{ ... }>` and must be awaited.
 *    `generateStaticParams` still returns a plain array, but the page
 *    receives its result through an awaited `params` promise.
 * 3. `export const metadata: Metadata` and `generateMetadata` are unchanged.
 * 4. Tailwind 4 uses `@tailwindcss/postcss` in `postcss.config.mjs` and
 *    `@import "tailwindcss";` in the root stylesheet.
 *
 * All four conventions in Step 1 matched the installed 16.4.2 docs.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
