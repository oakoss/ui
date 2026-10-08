import type { ComponentProps } from 'react';

import { tv } from 'tailwind-variants/lite';

import { cn } from '#/lib/cx';
import { focusRing } from '#/lib/recipes';

export type ScrollAreaProps = {
  orientation?: 'both' | 'horizontal' | 'vertical';
} & ComponentProps<'div'>;

const styles = tv({
  // Native scrollbars, thin, with a thumb as visible as an input's border.
  base: 'relative scrollbar-thin scrollbar-thumb-input scrollbar-track-transparent focus-visible:-outline-offset-3',
  variants: {
    orientation: {
      both: 'overflow-auto',
      horizontal: 'overflow-x-auto overflow-y-hidden',
      vertical: 'overflow-x-hidden overflow-y-auto',
    },
  },
});

export function ScrollArea({
  className,
  orientation = 'both',
  ...props
}: ScrollAreaProps) {
  return (
    <div
      data-slot="scroll-area"
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region needs keyboard access (axe scrollable-region-focusable)
      tabIndex={0}
      {...props}
      className={cn(focusRing, styles({ orientation }), className)}
      data-orientation={orientation}
    />
  );
}
