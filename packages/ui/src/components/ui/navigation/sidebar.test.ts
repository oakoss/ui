import { expect, test } from 'vitest';

import type {
  SidebarGroupActionProps,
  SidebarGroupProps,
} from '#/components/ui/navigation/sidebar-group';
import type {
  SidebarMenuActionProps,
  SidebarMenuButtonProps,
} from '#/components/ui/navigation/sidebar-menu';
import type {
  SidebarRailProps,
  SidebarTriggerProps,
} from '#/components/ui/navigation/sidebar-trigger';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('icon-only actions require a name', () => {
  const named: SidebarMenuActionProps = { 'aria-label': 'More' };
  // @ts-expect-error an icon-only action needs aria-label or aria-labelledby
  const unnamed: SidebarMenuActionProps = {};
  // @ts-expect-error an undefined name is no name
  const undefinedName: SidebarGroupActionProps = { 'aria-label': undefined };
  expect([named, unnamed, undefinedName]).toHaveLength(3);
});

test('a menu button is a link only with an href', () => {
  const link: SidebarMenuButtonProps = { href: '/inbox', isCurrent: true };
  const button: SidebarMenuButtonProps = { onPress: () => undefined };
  // @ts-expect-error a link-only prop needs an href
  const target: SidebarMenuButtonProps = { target: '_blank' };
  // @ts-expect-error className is a string, not a render function
  const render: SidebarMenuButtonProps = { className: () => 'x' };
  // @ts-expect-error a link drops button-only props
  const submit: SidebarMenuButtonProps = { href: '/inbox', type: 'submit' };
  expect([link, button, target, render, submit]).toHaveLength(5);
});

test('only a collapsible group takes expansion props', () => {
  const collapsible: SidebarGroupProps = {
    defaultExpanded: true,
    isCollapsible: true,
  };
  // @ts-expect-error isExpanded does nothing without isCollapsible
  const plain: SidebarGroupProps = { isExpanded: true };
  expect([collapsible, plain]).toHaveLength(2);
});

// Object types only: TypeScript doesn't check hyphenated JSX attributes, so
// the components also set the name after the spread.
test('the trigger and rail are named by label', () => {
  const trigger: SidebarTriggerProps = { label: 'Menu' };
  // @ts-expect-error label names the trigger
  const triggerName: SidebarTriggerProps = { 'aria-label': 'Menu' };
  // @ts-expect-error the trigger is always the icon size
  const sized: SidebarTriggerProps = { size: 'lg' };
  // @ts-expect-error label names the rail
  const railName: SidebarRailProps = { 'aria-label': 'Menu' };
  expect([trigger, triggerName, sized, railName]).toHaveLength(4);
});
