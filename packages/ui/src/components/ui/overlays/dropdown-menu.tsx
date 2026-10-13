import {
  type HeaderProps as AriaHeaderProps,
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
  MenuSeparator,
  MenuSubTrigger,
  type MenuSubTriggerProps,
} from '#/components/ui/overlays/menu';

export type DropdownMenuItemProps<T extends object = object> = MenuItemProps<T>;

export type DropdownMenuProps<T extends object = object> = MenuContentProps<T>;

// The popover and its menu; put it in a DropdownMenuTrigger after the button.
export function DropdownMenu<T extends object>(props: DropdownMenuProps<T>) {
  return <MenuContent<T> {...props} isSubmenu={false} kind="dropdown-menu" />;
}

export function DropdownMenuGroup<T extends object>(
  props: AriaMenuSectionProps<T>,
) {
  return <MenuGroup<T> {...props} kind="dropdown-menu" />;
}

export function DropdownMenuItem<T extends object>(
  props: DropdownMenuItemProps<T>,
) {
  return <MenuItem<T> {...props} kind="dropdown-menu" />;
}

export function DropdownMenuLabel(
  props: { inset?: boolean } & AriaHeaderProps,
) {
  return <MenuLabel {...props} kind="dropdown-menu" />;
}

export function DropdownMenuSeparator(props: AriaSeparatorProps) {
  return <MenuSeparator {...props} kind="dropdown-menu" />;
}

// Wraps a DropdownMenuSubTrigger and the DropdownMenuSubContent it opens.
export function DropdownMenuSub(props: AriaSubmenuTriggerProps) {
  return <AriaSubmenuTrigger {...props} />;
}

export function DropdownMenuSubContent<T extends object>(
  props: DropdownMenuProps<T>,
) {
  return <MenuContent<T> {...props} isSubmenu kind="dropdown-menu" />;
}

export function DropdownMenuSubTrigger<T extends object>(
  props: MenuSubTriggerProps<T>,
) {
  return <MenuSubTrigger<T> {...props} kind="dropdown-menu" />;
}

export function DropdownMenuTrigger(props: AriaMenuTriggerProps) {
  return <AriaMenuTrigger {...props} />;
}
