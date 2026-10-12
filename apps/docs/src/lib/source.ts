import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { pageSchema } from 'fumadocs-core/source/schema';
import { defineDocs } from 'fumadocs-mdx/macro';
import { z } from 'zod';

import { agentInstructions, pagePreamble } from '#/lib/llms';
import { docsRoute } from '#/lib/site';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    async: true,
    postprocess: { includeProcessedMarkdown: true },
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

${pagePreamble}

${await page.data.getText('processed')}`,
});

// llms.txt: the instructions, then the page links under one heading, as the
// llms.txt format expects one H1 followed by sections.
export function llmsIndex() {
  const links = source
    .getPageTree()
    .children.map((node) => docsLlms.indexNode(node));
  return `${agentInstructions}\n\n## Pages\n\n${links.join('\n')}\n`;
}
