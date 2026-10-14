import {
  Menu as AriaMenu,
  type MenuProps as AriaMenuProps,
} from 'react-aria-components';

import type { MenuKind } from '#/components/ui/overlays/menu-item';

import {
  PopoverContent,
  type PopoverContentProps,
} from '#/components/ui/overlays/popover';
import { cn } from '#/lib/cx';
import { emptyState } from '#/lib/empty-state';

export type MenuContentProps<T extends object = object> = {
  className?: string;
  // Shown when the menu has no items.
  emptyLabel?: string;
} & Omit<AriaMenuProps<T>, 'className' | 'renderEmptyState' | 'style'> &
  Pick<
    PopoverContentProps,
    'crossOffset' | 'offset' | 'placement' | 'shouldFlip'
  >;

export function MenuContent<T extends object>({
  className,
  crossOffset,
  emptyLabel,
  kind,
  offset,
  part = 'content',
  placement,
  shouldFlip,
  ...props
}: { kind: MenuKind; part?: 'content' | 'sub-content' } & MenuContentProps<T>) {
  return (
    <PopoverContent
      className={cn('w-auto min-w-32 p-1', className)}
      crossOffset={crossOffset}
      data-slot={`${kind}-${part}`}
      offset={offset}
      placement={placement}
      shouldFlip={shouldFlip}
    >
      <AriaMenu<T>
        className="max-h-[inherit] overflow-y-auto outline-hidden"
        data-slot={`${kind}-list`}
        renderEmptyState={emptyState(emptyLabel, 'px-2 py-1.5')}
        {...props}
      />
    </PopoverContent>
  );
}

// A submenu opens beside its item; the cross offset takes off the panel's
// padding and border, so its first item sits level with the trigger.
export function MenuSubContent<T extends object>({
  crossOffset = -5,
  offset = 0,
  placement = 'end top',
  ...props
}: { kind: MenuKind } & MenuContentProps<T>) {
  return (
    <MenuContent<T>
      {...props}
      crossOffset={crossOffset}
      offset={offset}
      part="sub-content"
      placement={placement}
    />
  );
}
