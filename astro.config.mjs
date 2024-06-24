import { defineConfig } from 'astro/config';
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  site: 'https://gcrois.github.io/',
  base: '/CherokeeAuto/',
  vite: {
    ssr: {
      noExternal: ['react-firebase-hooks'],
    },
  }
});