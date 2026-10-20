import type { MDXComponents } from 'mdx/types';

import { Step, Steps } from 'fumadocs-ui/components/steps';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';

import { CodePre, CodeTabs } from '#/components/code-pre';
import { DemoSource } from '#/components/demo-source';
import { ManualSource, ManualSources } from '#/components/manual-sources';
import { OwnPropsTable } from '#/components/own-props-table';
import { ProseTable } from '#/components/prose-table';
import { TokenTable } from '#/components/token-table';

// Demos are imported by the MDX page that uses them, not registered here.
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    CodeBlockTabs: CodeTabs,
    DemoSource,
    ManualSource,
    ManualSources,
    pre: CodePre,
    Step,
    Steps,
    table: ProseTable,
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
