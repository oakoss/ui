'use client';

import './Separator.css';

import {
  Separator as RACSeparator,
  type SeparatorProps as RACSeparatorProps,
} from 'react-aria-components';

type SeparatorProps = RACSeparatorProps;

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorProps) {
  return (
    <RACSeparator
      className={`separator ${className ?? ''}`}
      data-slot="separator"
      orientation={orientation}
      {...props}
    />
  );
}

export { Separator };
export type { SeparatorProps };
