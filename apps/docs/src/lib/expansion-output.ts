import type { Nodes } from 'mdast';

import { replaceSource } from 'fumadocs-core/mdx-plugins/stringifier';
import { gfmToMarkdown } from 'mdast-util-gfm';
import { mdxToMarkdown } from 'mdast-util-mdx';
import { toMarkdown } from 'mdast-util-to-markdown';

import { manualSources } from './manual-sources';

const clientOnly = 'ClientOnly';

export type File = Parameters<typeof replaceSource>[0];

// The mdast shapes the docs' remark plugins read and build.
export type Node = {
  attributes?: { name: string; value: unknown }[];
  children?: Node[];
  data?: { structuredData: { contents: { content: string }[] } };
  lang?: string;
  meta?: string;
  name?: string;
  type: string;
  url?: string;
  value?: string;
};

/**
Records the Markdown and search text of `expanded` in place of the authored
`node` it replaces: the `.md` output and search records come from the
authored source, which a generated node isn't part of.
*/
export function recordExpansion(file: File, node: Node, expanded: Node): Node {
  const shown = withoutManualSources(expanded);
  recordMarkdown(file, node, markdown(shown));
  const contents = paragraphs(shown).map((paragraph) => ({
    content: markdown(withLinkText(paragraph)).trim(),
  }));
  return { ...expanded, data: { structuredData: { contents } } };
}

// The Markdown the .md output shows in place of an authored node.
export function recordMarkdown(file: File, node: Node, text: string) {
  replaceSource(file, mdast(node), text);
}

function markdown(node: Node): string {
  return toMarkdown(mdast(node), {
    extensions: [mdxToMarkdown(), gfmToMarkdown()],
  });
}

function mdast(node: Node): Nodes {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Node is a structural subset of mdast
  return node as unknown as Nodes;
}

function paragraphs(node: Node): Node[] {
  if (node.type === 'paragraph') return [node];
  return node.children?.flatMap((child) => paragraphs(child)) ?? [];
}

// Search records keep a link's text and drop its address.
function withLinkText(node: Node): Node {
  if (!node.children) return node;
  return {
    ...node,
    children: node.children.flatMap((child) =>
      child.type === 'link' ? (child.children ?? []) : [withLinkText(child)],
    ),
  };
}

// The output links the manual-install files instead of inlining them, and
// shows a demo without the docs site's ClientOnly around it.
function withoutManualSources(node: Node): Node {
  if (!node.children) return node;
  return {
    ...node,
    children: node.children
      .filter((child) => child.name !== manualSources)
      .flatMap((child) =>
        child.name === clientOnly ? (child.children ?? []) : [child],
      )
      .map((child) => withoutManualSources(child)),
  };
}
