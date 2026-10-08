import type { ComponentProps } from 'react';

import { cn } from '#/lib/cx';

export type SkeletonProps = ComponentProps<'div'>;

// A placeholder shape means nothing to a screen reader; the loading region
// around it says it's busy. Forced colors repaint the fill as the page color,
// so the transparent border is what keeps the shape visible there.
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md border border-transparent bg-muted',
        className,
      )}
      data-slot="skeleton"
      {...props}
    />
  );
}
