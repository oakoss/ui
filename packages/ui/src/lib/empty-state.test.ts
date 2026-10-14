import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { emptyState } from '#/lib/empty-state';

test('a missing or blank label renders nothing', () => {
  expect(emptyState(undefined)).toBeUndefined();
  expect(emptyState('')).toBeUndefined();
  expect(emptyState(' '.repeat(3))).toBeUndefined();
});

test('a label renders it with the given classes', () => {
  expect(renderToStaticMarkup(emptyState('No results', 'py-6')?.())).toBe(
    '<div class="text-sm text-muted-foreground py-6">No results</div>',
  );
});
