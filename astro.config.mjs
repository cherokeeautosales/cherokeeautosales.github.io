import { defineConfig } from 'astro/config';
import react from "@astrojs/react";

import sitemap from '@astrojs/sitemap';

import robotsTxt from 'astro-robots-txt';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sitemap(), robotsTxt()],
  site: 'https://cherokeeautosalestn.com/',
  base: '/',
  vite: {
    ssr: {
      noExternal: ['react-firebase-hooks'],
      external: ['firebase/database']
    },
  }
});