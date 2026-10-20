import { expect, test } from 'vitest';

import {
  type DataTableState,
  firstPageAfter,
  initialDataTableState,
  isSelectionStale,
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

test.each(['columnVisibility', 'selection'] as const)(
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
  const first = nextDataTableState(
    onPage3,
    'globalFilter',
    (value) => `${value}a`,
  );
  const second = nextDataTableState(
    first,
    'globalFilter',
    (value) => `${value}b`,
  );
  expect(second.globalFilter).toBe('ab');
});

test('only a reset slice moves the page, after the change', () => {
  expect(firstPageAfter(onPage3, 'sorting')).toEqual({
    pageIndex: 0,
    pageSize: 10,
  });
  expect(firstPageAfter(onPage3, 'selection')).toBeUndefined();
  expect(firstPageAfter(onPage3, 'pagination')).toBeUndefined();
  expect(firstPageAfter(initialDataTableState, 'sorting')).toBeUndefined();
});

test('every controlled slice wins while defined, even when empty', () => {
  const own: DataTableState = {
    columnFilters: [{ id: 'status', value: 'paid' }],
    columnVisibility: { email: false },
    globalFilter: 'abc',
    pagination: { pageIndex: 2, pageSize: 10 },
    selection: { ids: ['a'] },
    sorting: [{ desc: false, id: 'amount' }],
  };
  expect(withControlled(own, initialDataTableState)).toEqual(
    initialDataTableState,
  );
  expect(withControlled(own, { globalFilter: undefined })).toEqual(own);
});

const allPaid: DataTableState = {
  ...initialDataTableState,
  columnFilters: [{ id: 'status', value: ['paid'] }],
  selection: { all: { filters: { status: ['paid'] } }, except: ['a'] },
};

test('a selection of everything matching ends with its filters', () => {
  expect(isSelectionStale(allPaid)).toBe(false);
  expect(isSelectionStale({ ...allPaid, columnFilters: [] })).toBe(true);
  expect(isSelectionStale({ ...allPaid, globalFilter: 'ada' })).toBe(true);
});

test('order and page keep a selection of everything matching', () => {
  const sorted = { ...allPaid, sorting: [{ desc: true, id: 'amount' }] };
  const paged = { ...allPaid, pagination: { pageIndex: 3, pageSize: 10 } };
  expect(isSelectionStale(sorted)).toBe(false);
  expect(isSelectionStale(paged)).toBe(false);
});

test('picked ids stay through a filter change', () => {
  const picked = { ...allPaid, selection: { ids: ['a', 'b'] } };
  expect(isSelectionStale({ ...picked, columnFilters: [] })).toBe(false);
});
