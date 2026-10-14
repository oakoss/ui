import { expect, test } from 'vitest';

import type { SearchFieldProps } from '#/components/ui/inputs/search-field';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('children and the layout props are exclusive', () => {
  const valid: SearchFieldProps[] = [
    {},
    { enterKeyHint: 'go', label: 'Recipes', size: 'sm' },
    { end: 'in titles', start: 'All' },
    { children: 'Custom' },
  ];
  const mixed: SearchFieldProps[] = [
    // @ts-expect-error children replace the layout
    { children: 'Custom', label: 'Recipes' },
    // @ts-expect-error children replace the layout
    { children: 'Custom', enterKeyHint: 'go' },
    // @ts-expect-error children replace the layout
    { children: 'Custom', end: 'in titles' },
  ];
  // @ts-expect-error empty children would render no input
  const empty: SearchFieldProps = { children: null };
  expect([...valid, ...mixed, empty]).toHaveLength(8);
});

test('enterKeyHint takes only the keys browsers label', () => {
  // @ts-expect-error not an Enter key label
  const hint: SearchFieldProps = { enterKeyHint: 'find' };
  expect([hint]).toHaveLength(1);
});
