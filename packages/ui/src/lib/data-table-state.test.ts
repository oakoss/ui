import { expect, test } from 'vitest';

import {
  type DataTableState,
  firstPageAfter,
  initialDataTableState,
  nextDataTableState,
  withControlled,
} from '#/lib/data-table-state';

const onPage3: DataTableState = {
  ...initialDataTableState,
  pagination: { pageIndex: 2, pageSize: 10 },
};

test('an updater function gets the current value', () => {
  const next = nextDataTableState(
    onPage3,
    'globalFilter',
    (value) => `${value}a`,
  );
  expect(next.globalFilter).toBe('a');
});

test.each(['columnFilters', 'globalFilter', 'sorting'] as const)(
  'a %s change shows the first page',
  (key) => {
    const next = nextDataTableState(onPage3, key, initialDataTableState[key]);
    expect(next.pagination).toEqual({ pageIndex: 0, pageSize: 10 });
  },
);

test.each(['columnVisibility', 'rowSelection'] as const)(
  'a %s change keeps the page',
  (key) => {
    const next = nextDataTableState(onPage3, key, initialDataTableState[key]);
    expect(next.pagination).toBe(onPage3.pagination);
  },
);

test('a sort on the first page keeps the same pagination', () => {
  const next = nextDataTableState(initialDataTableState, 'sorting', []);
  expect(next.pagination).toBe(initialDataTableState.pagination);
});

test('changes applied in turn build on each other', () => {
  const first = nextDataTableState(onPage3, 'rowSelection', (selection) => ({
    ...selection,
    a: true,
  }));
  const second = nextDataTableState(first, 'rowSelection', (selection) => ({
    ...selection,
    b: true,
  }));
  expect(second.rowSelection).toEqual({ a: true, b: true });
});

test('only a reset slice moves the page, after the change', () => {
  expect(firstPageAfter(onPage3, 'sorting')).toEqual({
    pageIndex: 0,
    pageSize: 10,
  });
  expect(firstPageAfter(onPage3, 'rowSelection')).toBeUndefined();
  expect(firstPageAfter(onPage3, 'pagination')).toBeUndefined();
  expect(firstPageAfter(initialDataTableState, 'sorting')).toBeUndefined();
});

test('every controlled slice wins while defined, even when empty', () => {
  const own: DataTableState = {
    columnFilters: [{ id: 'status', value: 'paid' }],
    columnVisibility: { email: false },
    globalFilter: 'abc',
    pagination: { pageIndex: 2, pageSize: 10 },
    rowSelection: { a: true },
    sorting: [{ desc: false, id: 'amount' }],
  };
  expect(withControlled(own, initialDataTableState)).toEqual(
    initialDataTableState,
  );
  expect(withControlled(own, { globalFilter: undefined })).toEqual(own);
});
