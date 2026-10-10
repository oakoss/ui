import { expect, test } from 'vitest';

import type { ButtonGroupProps } from '#/components/ui/inputs/button-group';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('the role follows whether the group is named', () => {
  const valid: ButtonGroupProps[] = [
    { 'aria-label': 'Message actions' },
    { orientation: 'vertical', size: 'sm', variant: 'outline' },
  ];
  // @ts-expect-error a named group is a group and an unnamed one presentation
  const withRole: ButtonGroupProps = { role: 'toolbar' };
  expect([...valid, withRole]).toHaveLength(3);
});

test('an icon size goes on each icon Button, which must then be named', () => {
  // @ts-expect-error a group-wide icon size would skip Button's name check
  const iconSize: ButtonGroupProps = { size: 'icon' };
  expect(iconSize).toBeDefined();
});
