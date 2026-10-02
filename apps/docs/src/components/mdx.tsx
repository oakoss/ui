import type { MDXComponents } from 'mdx/types';

import defaultMdxComponents from 'fumadocs-ui/mdx';

import { ButtonDemo } from '#/components/demos/button-demo';
import { TextFieldDemo } from '#/components/demos/text-field-demo';
import { OwnPropsTable } from '#/components/own-props-table';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ButtonDemo,
    TextFieldDemo,
    TypeTable: OwnPropsTable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
