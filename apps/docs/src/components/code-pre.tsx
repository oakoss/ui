import type { ComponentProps } from 'react';

import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';

// Paints each block in its Shiki theme's background, which the token colors
// meet WCAG AA against; Fumadocs' card gray drops some under 4.5:1.
export function CodePre(props: ComponentProps<typeof CodeBlock>) {
  return (
    <CodeBlock {...props} keepBackground>
      <Pre>{props.children}</Pre>
    </CodeBlock>
  );
}
