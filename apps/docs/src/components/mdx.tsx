import type { MDXComponents } from 'mdx/types';

import { Step, Steps } from 'fumadocs-ui/components/steps';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';

import { CodePre } from '#/components/code-pre';
import { ManualSource, ManualSources } from '#/components/manual-sources';
import { OwnPropsTable } from '#/components/own-props-table';
import { TokenTable } from '#/components/token-table';

// Demos are imported by the MDX page that uses them, not registered here.
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ManualSource,
    ManualSources,
    pre: CodePre,
    Step,
    Steps,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    TokenTable,
    TypeTable: OwnPropsTable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
