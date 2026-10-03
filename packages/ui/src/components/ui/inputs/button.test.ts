import { expect, test } from 'vitest';

import type { ButtonProps } from '#/components/ui/inputs/button';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('icon sizes need an accessible name', () => {
  // A labeled button may pick its size at runtime.
  const runtimeSized = (['icon', 'md'] as const).map((size): ButtonProps => ({
    'aria-label': 'Close',
    size,
  }));
  const valid: ButtonProps[] = [
    {},
    { size: 'lg' },
    { 'aria-label': 'Close', size: 'icon' },
    { 'aria-labelledby': 'title', size: 'icon-sm' },
    ...runtimeSized,
  ];
  // @ts-expect-error no accessible name
  const unnamed: ButtonProps = { size: 'icon' };
  // @ts-expect-error an undefined label isn't a name
  const undefinedLabel: ButtonProps = { 'aria-label': undefined, size: 'icon' };
  expect([...valid, unnamed, undefinedLabel]).toHaveLength(8);
});
