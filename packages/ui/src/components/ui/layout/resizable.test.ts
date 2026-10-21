import { expect, test } from 'vitest';

import type { ResizableHandleProps } from '#/components/ui/layout/resizable';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('a handle requires a name', () => {
  const named: ResizableHandleProps[] = [
    { 'aria-label': 'Resize sidebar' },
    { 'aria-labelledby': 'sidebar-title' },
    { 'aria-label': 'Resize sidebar', withHandle: true },
  ];
  // @ts-expect-error no accessible name
  const unnamed: ResizableHandleProps = {};
  // @ts-expect-error a grip isn't a name
  const gripOnly: ResizableHandleProps = { withHandle: true };
  expect([...named, unnamed, gripOnly]).toHaveLength(5);
});
