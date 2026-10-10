import { expect, test } from 'vitest';

import type { BreadcrumbListProps } from '#/components/ui/navigation/breadcrumb';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test("the list's id stays the one that names the nav", () => {
  const valid: BreadcrumbListProps<object> = { className: 'gap-1' };
  // @ts-expect-error a consumer's id would leave the nav's name pointing nowhere
  const withId: BreadcrumbListProps<object> = { id: 'trail' };
  expect([valid, withId]).toHaveLength(2);
});
