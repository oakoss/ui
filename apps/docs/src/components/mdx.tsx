import type { MDXComponents } from 'mdx/types';
import type { ComponentProps, ReactNode } from 'react';

import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
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
    pre: CodePre,
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

// Paints each block in its Shiki theme's background, which the token colors
// meet WCAG AA against; Fumadocs' card gray drops some under 4.5:1.
function CodePre(props: ComponentProps<typeof CodeBlock>) {
  return (
    <CodeBlock {...props} keepBackground>
      <Pre>{props.children}</Pre>
    </CodeBlock>
  );
}

function ManualSources({ children }: { children: ReactNode }) {
  return children;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
