import { expect, test } from 'vitest';

import type { PaginationProps } from '#/components/ui/navigation/pagination';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('the landmark is named through label alone', () => {
  const valid: PaginationProps[] = [
    { label: 'Results pages' },
    { 'aria-labelledby': 'results-heading' },
  ];
  // @ts-expect-error label sets aria-label, which would overwrite this one
  const withAriaLabel: PaginationProps = { 'aria-label': 'Pages' };
  expect([...valid, withAriaLabel]).toHaveLength(3);
});
