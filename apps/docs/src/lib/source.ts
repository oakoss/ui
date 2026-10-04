import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { pageSchema } from 'fumadocs-core/source/schema';
import { defineDocs } from 'fumadocs-mdx/macro';
import { z } from 'zod';

import { manualSources } from '#/lib/manual-sources';
import { docsRoute } from '#/lib/site';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    async: true,
    postprocess: {
      includeProcessedMarkdown: {
        filterElement: (node) =>
          !('name' in node && node.name === manualSources),
      },
    },
    // A component page names its registry item and React Aria docs page for
    // the links under its title.
    schema: pageSchema.extend({
      item: z.string().optional(),
      reactAria: z.url().optional(),
    }),
  },
});

export const source = loader({
  baseUrl: docsRoute,
  plugins: [lucideIconsPlugin()],
  source: docs.toFumadocsSource(),
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
