import { expect, test } from 'vitest';

import type { DataTableError } from '#/components/ui/data/data-table-body';

import {
  optionValues,
  type UseDataTableOptions,
  valueText,
} from '#/hooks/use-data-table';

type Payment = { amount: number; id: string };

const columns: UseDataTableOptions<Payment>['columns'] = [
  { accessorKey: 'amount', header: 'Amount' },
];
const data: Payment[] = [{ amount: 1, id: 'a' }];

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('server mode needs the total row count', () => {
  const server: UseDataTableOptions<Payment> = {
    columns,
    data,
    mode: 'server',
    rowCount: 40,
  };
  // @ts-expect-error a server page can't page through without the total
  const uncounted: UseDataTableOptions<Payment> = {
    columns,
    data,
    mode: 'server',
  };
  expect([server, uncounted]).toHaveLength(2);
});

test('selecting rows needs row ids from the data', () => {
  const selectable: UseDataTableOptions<Payment> = {
    columns,
    data,
    enableRowSelection: true,
    getRowId: (row) => row.id,
  };
  // @ts-expect-error index ids point at other rows once the data sorts
  const unkeyed: UseDataTableOptions<Payment> = {
    columns,
    data,
    enableRowSelection: true,
  };
  const canSelect = Math.random() > 0.5;
  const flagged: UseDataTableOptions<Payment> = {
    columns,
    data,
    enableRowSelection: canSelect,
    getRowId: (row) => row.id,
  };
  // @ts-expect-error a flag that may be on needs row ids too
  const unkeyedFlag: UseDataTableOptions<Payment> = {
    columns,
    data,
    enableRowSelection: canSelect,
  };
  const plain: UseDataTableOptions<Payment> = { columns, data };
  expect([selectable, unkeyed, flagged, unkeyedFlag, plain]).toHaveLength(5);
});

function failedMessage(isError: boolean): DataTableError {
  return isError && 'Payments failed to load.';
}

test('an error is a message, not a flag or a count', () => {
  const isError = Math.random() > 0.5;
  const message = failedMessage(isError);
  // @ts-expect-error a bare true renders an empty alert
  const flag: DataTableError = isError;
  // @ts-expect-error `count && message` passes 0, which renders as text
  const count: DataTableError = 0;
  expect([message, flag, count]).toHaveLength(3);
});

test('client mode takes no row count', () => {
  // @ts-expect-error client tables count their own rows
  const counted: UseDataTableOptions<Payment> = { columns, data, rowCount: 5 };
  expect(counted).toBeDefined();
});

test('column meta takes only the keys the parts read', () => {
  const aligned: UseDataTableOptions<Payment>['columns'] = [
    { accessorKey: 'amount', meta: { align: 'end', label: 'Amount' } },
  ];
  const unknown: UseDataTableOptions<Payment>['columns'] = [
    // @ts-expect-error meta keys are DataTableColumnMeta's
    { accessorKey: 'amount', meta: { width: 120 } },
  ];
  expect([aligned, unknown]).toHaveLength(2);
});

test('a filter value reads as picked options', () => {
  expect(optionValues(undefined)).toEqual([]);
  expect(optionValues(null)).toEqual([]);
  expect(optionValues('paid')).toEqual(['paid']);
  expect(optionValues([1, 'a', true])).toEqual(['1', 'a', 'true']);
});

test('a missing value has no text', () => {
  expect(valueText(undefined)).toBeUndefined();
  expect(valueText(null)).toBeUndefined();
  expect(valueText(new Date(NaN))).toBeUndefined();
  expect(valueText(0)).toBe('0');
  expect(valueText(false)).toBe('false');
});

test('a date reads as ISO text and a bigint as its digits', () => {
  const date = new Date(Date.UTC(2026, 9, 1));
  expect(valueText(date)).toBe('2026-10-01T00:00:00.000Z');
  expect(valueText(10n)).toBe('10');
});
