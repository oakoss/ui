import { createElement, type ReactElement } from 'react';

import { cn } from '#/lib/cx';

// A collection's renderEmptyState for its emptyLabel. A blank label renders
// nothing, since React Aria would still mount its empty row, unnamed, which
// axe flags.
export function emptyState(
  label: string | undefined,
  className?: string,
): (() => ReactElement) | undefined {
  return (label ?? '').trim() === ''
    ? undefined
    : () =>
        createElement(
          'div',
          { className: cn('text-sm text-muted-foreground', className) },
          label,
        );
}
