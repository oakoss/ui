import type { MDXComponents } from 'mdx/types';

import defaultMdxComponents from 'fumadocs-ui/mdx';

import { OwnPropsTable } from '#/components/own-props-table';

// Demos are imported by the MDX page that uses them, not registered here.
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    TypeTable: OwnPropsTable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
