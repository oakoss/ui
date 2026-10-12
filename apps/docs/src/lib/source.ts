import type * as PageTree from 'fumadocs-core/page-tree';

import { llms, loader } from 'fumadocs-core/source';
import { pageSchema } from 'fumadocs-core/source/schema';
import { defineDocs } from 'fumadocs-mdx/macro';
import { z } from 'zod';

import { agentInstructions, pagePreamble } from '#/lib/llms';
import { pageIcon } from '#/lib/page-icons';
import { docsRoute, markdownUrl, siteUrl } from '#/lib/site';

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
  icon: pageIcon,
  source: docs.toFumadocsSource(),
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${pagePreamble}

${await page.data.getText('processed')}`,
});

/**
llms.txt: the instructions, then a section per area: Overview for the root
pages, then each top-level folder. Each line links the page's Markdown by
absolute URL, so an agent fetches Markdown and the list works pasted
anywhere.
*/
export function llmsIndex() {
  const { children } = source.getPageTree();
  const root = children.filter((node) => node.type === 'page');
  const folders = children.filter((node) => node.type === 'folder');
  const sections = [
    section('Overview', root),
    ...folders.map((folder) =>
      section(folderTitle(folder), [
        ...(folder.index ? [folder.index] : []),
        ...folder.children,
      ]),
    ),
  ];
  return `${agentInstructions}\n\n${sections.join('\n\n')}\n`;
}

// A folder's name is a ReactNode; Fumadocs titles ours from the folder name.
function folderTitle(folder: PageTree.Folder): string {
  if (typeof folder.name !== 'string') {
    throw new TypeError('a docs folder needs a plain-text title');
  }
  return folder.name;
}

function pageLine(node: PageTree.Node): string[] {
  if (node.type === 'folder') {
    const pages = node.index ? [node.index, ...node.children] : node.children;
    return pages.flatMap((child) => pageLine(child));
  }
  if (node.type !== 'page') return [];
  const page = source.getNodePage(node);
  if (page === undefined) throw new Error(`no page for ${node.url}`);
  const link = `[${page.data.title}](${siteUrl}${markdownUrl(page.slugs)})`;
  const { description } = page.data;
  return [
    description === undefined || description === ''
      ? `- ${link}`
      : `- ${link}: ${description}`,
  ];
}

function section(title: string, nodes: PageTree.Node[]) {
  const lines = nodes.flatMap((node) => pageLine(node));
  return `## ${title}\n\n${lines.join('\n')}`;
}
