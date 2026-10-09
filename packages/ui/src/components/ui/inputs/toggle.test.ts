import { expect, test } from 'vitest';

import type { ToggleGroupItemProps } from '#/components/ui/inputs/toggle-group';

import { type ToggleProps, toggleStyles } from '#/components/ui/inputs/toggle';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('an icon-only toggle needs a name', () => {
  const valid: ToggleProps[] = [
    { children: 'Bold' },
    { 'aria-label': 'Bold', size: 'icon' },
    { 'aria-labelledby': 'bold-label', size: 'icon-sm' },
  ];
  // @ts-expect-error an icon size has no text to name it
  const unnamed: ToggleProps = { size: 'icon' };
  expect([...valid, unnamed]).toHaveLength(4);
});

test('a group item needs the id the group selects it by', () => {
  const valid: ToggleGroupItemProps = { children: 'Bold', id: 'bold' };
  // @ts-expect-error without an id it isn't part of the group's selection
  const unkeyed: ToggleGroupItemProps = { children: 'Bold' };
  expect([valid, unkeyed]).toHaveLength(2);
});

test("toggleStyles lets a consumer's class win over its own", () => {
  const classes = toggleStyles({ className: 'rounded-full' }).split(' ');
  expect(classes).toContain('rounded-full');
  expect(classes).not.toContain('rounded-control');
});

test('a toggle takes the ghost and outline looks only', () => {
  const valid: ToggleProps[] = [{ variant: 'ghost' }, { variant: 'outline' }];
  // @ts-expect-error a solid toggle couldn't show its on state
  const solid: ToggleProps = { variant: 'solid' };
  expect([...valid, solid]).toHaveLength(3);
});
