import {
  Separator as AriaSeparator,
  type SeparatorProps as AriaSeparatorProps,
  SeparatorContext,
  useSlottedContext,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import { cn } from '#/lib/cx';

export type SeparatorProps = AriaSeparatorProps;

const styles = tv({
  base: 'shrink-0 border-border',
  variants: {
    orientation: {
      horizontal: 'w-full border-t',
      vertical: 'self-stretch border-s',
    },
  },
});

export function Separator({
  className,
  orientation,
  ...props
}: SeparatorProps) {
  // A surrounding SeparatorContext can set the orientation.
  const context = useSlottedContext(SeparatorContext, props.slot);
  const resolved = orientation ?? context?.orientation ?? 'horizontal';
  return (
    <AriaSeparator
      data-slot="separator"
      orientation={resolved}
      {...props}
      className={cn(styles({ orientation: resolved }), className)}
      data-orientation={resolved}
    />
  );
}
