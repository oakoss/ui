'use client';

import './Separator.css';

import {
  Separator as SeparatorPrimitive,
  type SeparatorProps as SeparatorPrimitiveProps,
} from 'react-aria-components';

type SeparatorProps = SeparatorPrimitiveProps;

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive
      className={`separator ${className ?? ''}`}
      data-slot="separator"
      orientation={orientation}
      {...props}
    />
  );
}

export { Separator };
export type { SeparatorProps };
