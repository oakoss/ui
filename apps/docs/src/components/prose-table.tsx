import type { ComponentProps } from 'react';

import { useScrollRegion } from '@oakoss/ui/hooks/use-scroll-region';
import { cn } from '@oakoss/ui/lib/cx';
import { focusRing } from '@oakoss/ui/lib/recipes';

// Fumadocs' table wrapper, made a tab stop while it overflows so a keyboard
// can scroll it. A Markdown table has no name, so it never becomes a region.
export function ProseTable(props: ComponentProps<'table'>) {
  const region = useScrollRegion<HTMLDivElement>({});
  return (
    <div
      {...region.props}
      className={cn(
        focusRing,
        'prose-no-margin relative my-6 overflow-auto focus-visible:-outline-offset-3',
      )}
    >
      <table {...props} />
    </div>
  );
}
