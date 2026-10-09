import { createContext, type ReactNode, use } from 'react';
import {
  ToggleButton as AriaToggleButton,
  ToggleButtonGroup as AriaToggleButtonGroup,
  type ToggleButtonGroupProps as AriaToggleButtonGroupProps,
  type ToggleButtonProps as AriaToggleButtonProps,
  type Key,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import type { ButtonStyleProps } from '#/components/ui/inputs/button';

import {
  toggleStyles,
  type ToggleVariant,
} from '#/components/ui/inputs/toggle';
import { cx } from '#/lib/cx';

// An item without an id isn't part of the group's selection, so it's
// required. An item can't see its group's size, so an icon item's name isn't
// checked here; give each one an aria-label.
export type ToggleGroupItemProps = {
  id: Key;
  size?: ButtonStyleProps['size'];
  variant?: ToggleVariant;
} & Omit<AriaToggleButtonProps, 'id'>;

export type ToggleGroupProps = {
  children?: ReactNode;
  // Items share their edges, with no gap between them.
  joined?: boolean;
  size?: ButtonStyleProps['size'];
  variant?: ToggleVariant;
} & Omit<AriaToggleButtonGroupProps, 'children'>;

type GroupStyle = Required<
  Pick<ToggleGroupProps, 'joined' | 'size' | 'variant'>
>;

const ToggleGroupContext = createContext<GroupStyle>({
  joined: false,
  size: 'md',
  variant: 'ghost',
});

const groupStyles = tv({
  base: 'group/toggle-group flex w-fit items-center orientation-vertical:flex-col orientation-vertical:items-stretch',
  variants: { joined: { false: 'gap-2', true: '' } },
});

// The focused item rises so its outline isn't covered, and a selected item
// keeps a contrasting border so selected neighbors don't merge into one block.
const joinedItem =
  'rounded-none selected:border-background forced-colors:selected:border-[HighlightText] focus-visible:z-10 group-orientation-horizontal/toggle-group:not-first:-ms-px group-orientation-horizontal/toggle-group:first:rounded-s-control group-orientation-horizontal/toggle-group:last:rounded-e-control group-orientation-vertical/toggle-group:not-first:-mt-px group-orientation-vertical/toggle-group:first:rounded-t-control group-orientation-vertical/toggle-group:last:rounded-b-control';

export function ToggleGroup({
  children,
  className,
  joined = false,
  size = 'md',
  variant = 'ghost',
  ...props
}: ToggleGroupProps) {
  return (
    <AriaToggleButtonGroup
      data-slot="toggle-group"
      {...props}
      className={cx(groupStyles({ joined }), className)}
      data-joined={joined || undefined}
      data-size={size}
      data-variant={variant}
    >
      <ToggleGroupContext value={{ joined, size, variant }}>
        {children}
      </ToggleGroupContext>
    </AriaToggleButtonGroup>
  );
}

// Items take the group's size and variant unless they set their own. Their
// 44px hit areas would overlap at the group's spacing, so they're off.
export function ToggleGroupItem({
  className,
  size,
  variant,
  ...props
}: ToggleGroupItemProps) {
  const group = use(ToggleGroupContext);
  const style = {
    size: size ?? group.size,
    targetSize: false,
    variant: variant ?? group.variant,
  };
  return (
    <AriaToggleButton
      data-slot="toggle-group-item"
      {...props}
      className={cx(
        toggleStyles({ ...style, className: group.joined ? joinedItem : '' }),
        className,
      )}
      data-size={style.size}
      data-variant={style.variant}
    />
  );
}
