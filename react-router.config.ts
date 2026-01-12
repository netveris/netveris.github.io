import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Disable SSR for static hosting (GitHub Pages)
  ssr: false,
  // Use basename for GitHub Pages deployment
  basename: process.env.GITHUB_PAGES === "true" ? "/netveris.github.io" : "/",
  future: {
    unstable_optimizeDeps: true,
  },
} satisfies Config;
