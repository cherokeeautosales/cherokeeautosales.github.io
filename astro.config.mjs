import { defineConfig } from 'astro/config';
import react from "@astrojs/react";

import sitemap from '@astrojs/sitemap';

import robotsTxt from 'astro-robots-txt';
import llms from 'astro-llms-md';
import { excludedMarkdownPages } from './src/data/llms.ts';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    sitemap(),
    robotsTxt(),
    llms({
      // The Astro endpoint owns the curated index; the plugin exports page content.
      generateLlmsTxt: false,
      generateLlmsFullTxt: false,
      generateIndividualMd: true,
      titleSelector: 'title',
      contentSelector: 'main',
      exclude: excludedMarkdownPages.map((page) => `${page}/index.html`),
      excludeSelectors: ['nav', 'aside', 'form', '#inventory', '[aria-hidden="true"]', '[hidden]'],
    }),
  ],
  site: 'https://cherokeeautosalestn.com/',
  base: '/',
  vite: {
    ssr: {
      noExternal: ['react-firebase-hooks'],
      external: ['firebase/database']
    },
  }
});
