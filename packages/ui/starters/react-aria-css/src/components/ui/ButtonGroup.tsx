'use client';

import './ButtonGroup.css';

import {
  Group as GroupPrimitive,
  type GroupProps as GroupPrimitiveProps,
} from 'react-aria-components';

import {
  Separator,
  type SeparatorProps,
} from '@/starters/react-aria-css/src/components/ui/Separator';

type ButtonGroupOrientation = 'horizontal' | 'vertical';

type ButtonGroupProps = {
  /** The orientation of the button group. @default "horizontal" */
  orientation?: ButtonGroupOrientation;
} & GroupPrimitiveProps;

function ButtonGroup({
  className,
  orientation = 'horizontal',
  ...props
}: ButtonGroupProps) {
  return (
    <GroupPrimitive
      className={`button-group ${className ?? ''}`}
      data-orientation={orientation}
      data-slot="button-group"
      {...props}
    />
  );
}

type ButtonGroupSeparatorProps = SeparatorProps;

function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: ButtonGroupSeparatorProps) {
  return (
    <Separator
      className={`button-group-separator ${className ?? ''}`}
      data-slot="button-group-separator"
      orientation={orientation}
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupSeparator };
export type {
  ButtonGroupOrientation,
  ButtonGroupProps,
  ButtonGroupSeparatorProps,
};
