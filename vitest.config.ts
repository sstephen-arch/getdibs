import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  /* Mirrors next.config.ts's `trailingSlash: true`. Next's <Link> reads this
     build-time flag to normalise hrefs; without it, tests see hrefs with the
     trailing slash stripped even though the export writes directory URLs. */
  test: { environment: "node", globals: true, env: { __NEXT_TRAILING_SLASH: "true" } },
});
