// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Static (SPA) build for GitHub Pages: `STATIC_BASE=/world-quest-collect/ npm run build`.
// Without STATIC_BASE the config is unchanged, so Lovable keeps working as before.
const staticBase = process.env["STATIC_BASE"];

export default defineConfig({
  vite: staticBase ? { base: staticBase } : {},
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(staticBase
      ? {
          spa: {
            enabled: true,
            prerender: { outputPath: "/index.html", crawlLinks: false },
          },
        }
      : {}),
  },
});
