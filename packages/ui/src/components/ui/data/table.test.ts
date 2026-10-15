import { expect, test } from 'vitest';

import type {
  TableCellProps,
  TableHeadProps,
} from '#/components/ui/data/table';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('align takes logical values, not the HTML attribute', () => {
  const cells: TableCellProps[] = [
    { align: 'end' },
    { align: 'start' },
    { align: 'center' },
  ];
  const heads: TableHeadProps[] = [
    { align: 'end' },
    { align: 'start' },
    { align: 'center' },
  ];
  // @ts-expect-error HTML's physical align is replaced
  const cell: TableCellProps = { align: 'right' };
  // @ts-expect-error HTML's physical align is replaced
  const head: TableHeadProps = { align: 'left' };
  expect([...cells, ...heads, cell, head]).toHaveLength(8);
});

test('scope takes only the values HTML defines', () => {
  const valid: TableHeadProps[] = [{ scope: 'col' }, { scope: 'rowgroup' }];
  // @ts-expect-error not a scope
  const invalid: TableHeadProps = { scope: 'column' };
  expect([...valid, invalid]).toHaveLength(3);
});
