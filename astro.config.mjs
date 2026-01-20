import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://devutils.tools",
  integrations: [react(), tailwind(), mdx(), sitemap()],
  output: "static",
});
