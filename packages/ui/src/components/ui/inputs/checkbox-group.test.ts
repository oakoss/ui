import { expect, test } from 'vitest';

import type {
  CheckboxGroupItemProps,
  CheckboxGroupProps,
} from '#/components/ui/inputs/checkbox-group';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('the group takes an orientation of its own', () => {
  const valid: CheckboxGroupProps[] = [
    { orientation: 'horizontal' },
    { orientation: 'vertical', variant: 'card' },
  ];
  // @ts-expect-error only horizontal or vertical
  const diagonal: CheckboxGroupProps = { orientation: 'diagonal' };
  expect([...valid, diagonal]).toHaveLength(3);
});

test('errors belong to the group, not its items', () => {
  const valid: CheckboxGroupItemProps[] = [
    { description: 'Extra melted on top.', value: 'cheese' },
    { isIndeterminate: true, value: 'all' },
  ];
  // @ts-expect-error the group shows errors
  const message: CheckboxGroupItemProps = { errorMessage: 'Pick one.' };
  expect([...valid, message]).toHaveLength(3);
});
