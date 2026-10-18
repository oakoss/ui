import optimizeLocales from '@react-aria/optimize-locales-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { defineConfig } from 'vite';

import { dataModulePlugin } from './src/lib/data-module-plugin.ts';
import { manualSourcesPlugin } from './src/lib/manual-sources-plugin.ts';
import { staticPages } from './src/lib/static-pages.ts';
import { themeItemPaths, themeOptions } from './src/lib/theme-items.ts';
import { tokenReference } from './src/lib/token-reference.ts';

export default defineConfig({
  plugins: [
    // The site is English; the localization guide's demo switches to Arabic.
    optimizeLocales.vite({ locales: ['en', 'ar'] }),
    fumadocsMdx(),
    manualSourcesPlugin(),
    dataModulePlugin('virtual:theme-options', () => ({
      themeOptions: themeOptions(),
    })),
    dataModulePlugin('virtual:token-reference', () => ({
      tokenReference: tokenReference(),
    })),
    tailwindcss(),
    tanstackStart({
      // autoSubfolderIndex false writes /404 to 404.html, which the host
      // serves for unknown URLs.
      pages: [...staticPages.map(({ path }) => path), ...themeItemPaths].map(
        (path) => ({ path, prerender: { autoSubfolderIndex: false } }),
      ),
      prerender: { crawlLinks: true, enabled: true, failOnError: true },
    }),
    react(),
  ],
  server: { port: 3000 },
});
