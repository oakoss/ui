import type { MDXComponents } from 'mdx/types';
import type { ReactNode } from 'react';

import { Step, Steps } from 'fumadocs-ui/components/steps';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';

import { OwnPropsTable } from '#/components/own-props-table';

// Demos are imported by the MDX page that uses them, not registered here.
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ManualSources,
    Step,
    Steps,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    TypeTable: OwnPropsTable,
    ...components,
  } satisfies MDXComponents;
}

function ManualSources({ children }: { children: ReactNode }) {
  return children;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
