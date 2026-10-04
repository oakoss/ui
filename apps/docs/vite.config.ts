import optimizeLocales from '@react-aria/optimize-locales-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { defineConfig } from 'vite';

import { staticPages } from './src/lib/static-pages';

export default defineConfig({
  plugins: [
    // The site is English; the localization guide's demo switches to Arabic.
    optimizeLocales.vite({ locales: ['en', 'ar'] }),
    fumadocsMdx(),
    tailwindcss(),
    tanstackStart({
      // autoSubfolderIndex false writes /404 to 404.html, which the host
      // serves for unknown URLs.
      pages: staticPages.map(({ path }) => ({
        path,
        prerender: { autoSubfolderIndex: false },
      })),
      prerender: { crawlLinks: true, enabled: true, failOnError: true },
    }),
    react(),
  ],
  server: { port: 3000 },
});
