import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

import { lucideIcons } from '../src/components/icon-resolver';

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

test('the docs resolve every Lucide icon icons.tsx names', () => {
  const names = new Set(
    icons.matchAll(/lucide="(\w+)"/gu).map(([, name = '']) => name),
  );
  expect(Object.keys(lucideIcons).toSorted(byName)).toEqual(
    [...names].toSorted(byName),
  );
});
