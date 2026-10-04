import { expect, test } from 'vitest';

import type { InputProps } from '#/components/ui/inputs/field';
import type { TextFieldProps } from '#/components/ui/inputs/text-field';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('children and the layout props are exclusive', () => {
  const valid: TextFieldProps[] = [
    {},
    { description: 'Shown below', label: 'Email', size: 'sm' },
    { children: 'Custom' },
    { children: undefined, label: 'Email' },
  ];
  const mixed: TextFieldProps[] = [
    // @ts-expect-error children replace the layout
    { children: 'Custom', label: 'Email' },
    // @ts-expect-error children replace the layout
    { children: 'Custom', description: 'Shown below' },
    // @ts-expect-error children replace the layout
    { children: 'Custom', size: 'sm' },
    // @ts-expect-error children replace the layout
    { children: 'Custom', errors: [] },
  ];
  // @ts-expect-error empty children would render no input
  const empty: TextFieldProps = { children: null };
  expect([...valid, ...mixed, empty]).toHaveLength(9);
});

test("Input's size is the control height", () => {
  const valid: InputProps[] = [{ size: 'sm' }, { size: 'lg' }];
  // @ts-expect-error HTML's character-width size
  const htmlSize: InputProps = { size: 20 };
  expect([...valid, htmlSize]).toHaveLength(3);
});
