import type { ComponentProps } from 'react';

import { tv } from 'tailwind-variants/lite';

import { useScrollContainer } from '#/hooks/use-scroll-region';
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
  const container = useScrollContainer(props);
  return (
    <div
      data-slot="scroll-area"
      {...container}
      className={cn(focusRing, styles({ orientation }), className)}
      data-orientation={orientation}
    />
  );
}
