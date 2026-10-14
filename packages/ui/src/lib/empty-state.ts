import { createElement, type ReactElement } from 'react';

import { cn } from '#/lib/cx';

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
