import { readFileSync } from 'node:fs';
import path from 'node:path';
import { isValidElement } from 'react';
import { expect, test } from 'vitest';

import { lucideIcons } from '#/components/icon-resolver';
import { pageIcon } from '#/lib/page-icons';

const icons = readFileSync(
  path.join(
    import.meta.dirname,
    '../../../packages/ui/src/components/icons.tsx',
  ),
  'utf-8',
);

function byName(a: string, b: string) {
  return a.localeCompare(b);
}

test('page icons resolve by name', () => {
  expect(isValidElement(pageIcon('BookOpen'))).toBe(true);
  expect(pageIcon(undefined)).toBeUndefined();
});

test('an unknown page icon fails loudly', () => {
  expect(() => pageIcon('House')).toThrow('No page icon named House');
});

test('the docs resolve every Lucide icon icons.tsx names', () => {
  const names = new Set(
    icons.matchAll(/lucide="(\w+)"/gu).map(([, name = '']) => name),
  );
  expect(Object.keys(lucideIcons).toSorted(byName)).toEqual(
    [...names].toSorted(byName),
  );
});
