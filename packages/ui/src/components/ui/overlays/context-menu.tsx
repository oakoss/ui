import {
  type MenuSectionProps as AriaMenuSectionProps,
  MenuTrigger as AriaMenuTrigger,
  type MenuTriggerProps as AriaMenuTriggerProps,
  type SeparatorProps as AriaSeparatorProps,
  SubmenuTrigger as AriaSubmenuTrigger,
  type SubmenuTriggerProps as AriaSubmenuTriggerProps,
} from 'react-aria-components';

import {
  MenuContent,
  type MenuContentProps,
  MenuGroup,
  MenuItem,
  type MenuItemProps,
  MenuLabel,
  type MenuLabelProps,
  MenuSeparator,
  MenuSubContent,
  MenuSubTrigger,
  type MenuSubTriggerProps,
} from '#/components/ui/overlays/menu';

export type ContextMenuItemProps<T extends object = object> = MenuItemProps<T>;

export type ContextMenuProps<T extends object = object> = MenuContentProps<T>;

// The menu opens with its corner on the pointer; put it in a
// ContextMenuTrigger after the target.
export function ContextMenu<T extends object>({
  offset = 0,
  placement = 'bottom start',
  ...props
}: ContextMenuProps<T>) {
  return (
    <MenuContent<T>
      {...props}
      kind="context-menu"
      offset={offset}
      placement={placement}
    />
  );
}

export function ContextMenuGroup<T extends object>(
  props: AriaMenuSectionProps<T>,
) {
  return <MenuGroup<T> {...props} kind="context-menu" />;
}

export function ContextMenuItem<T extends object>(
  props: ContextMenuItemProps<T>,
) {
  return <MenuItem<T> {...props} kind="context-menu" />;
}

export function ContextMenuLabel(props: MenuLabelProps) {
  return <MenuLabel {...props} kind="context-menu" />;
}

export function ContextMenuSeparator(props: AriaSeparatorProps) {
  return <MenuSeparator {...props} kind="context-menu" />;
}

// Wraps a ContextMenuSubTrigger and the ContextMenuSubContent it opens.
export function ContextMenuSub(props: AriaSubmenuTriggerProps) {
  return <AriaSubmenuTrigger {...props} />;
}

export function ContextMenuSubContent<T extends object>(
  props: ContextMenuProps<T>,
) {
  return <MenuSubContent<T> {...props} kind="context-menu" />;
}

export function ContextMenuSubTrigger<T extends object>(
  props: MenuSubTriggerProps<T>,
) {
  return <MenuSubTrigger<T> {...props} kind="context-menu" />;
}

// Opens on right-click, long press, Shift+F10 or the context menu key. The
// target must be a React Aria component or a focusable element inside
// React Aria's Pressable, or keyboard users can't reach it.
export function ContextMenuTrigger(
  props: Omit<AriaMenuTriggerProps, 'trigger'>,
) {
  return <AriaMenuTrigger {...props} trigger="contextMenu" />;
}
