import { expect, test } from 'vitest';

import {
  type DataTableError,
  dataTableStatus,
  hasError,
} from '#/lib/data-table-status';

// Page 2 of 25 rows, ten a page, under one header row.
const page2 = {
  error: undefined,
  headerRows: 1,
  isFiltered: false,
  isLoading: false,
  pageIndex: 1,
  pageSize: 10,
  rows: 10,
  total: 25,
};

test('a partial page counts its rows from the header', () => {
  expect(dataTableStatus(page2)).toEqual({
    isError: false,
    kind: 'rows',
    range: { firstRowIndex: 12, rowCount: 26 },
  });
});

test('a table showing every row gives no counts', () => {
  expect(dataTableStatus({ ...page2, pageIndex: 0, rows: 25 })).toEqual({
    isError: false,
    kind: 'rows',
    range: undefined,
  });
});

test('loading wins over an error and rows', () => {
  expect(
    dataTableStatus({ ...page2, error: 'Failed', isLoading: true }),
  ).toEqual({ kind: 'loading' });
});

test('an error keeps the rows under it, without counts', () => {
  expect(dataTableStatus({ ...page2, error: 'Failed' })).toEqual({
    isError: true,
    kind: 'rows',
  });
});

test('an error with no rows takes their place', () => {
  expect(dataTableStatus({ ...page2, error: 'Failed', rows: 0 })).toEqual({
    kind: 'failed',
  });
});

test('no rows says empty, or no results while filtered', () => {
  expect(dataTableStatus({ ...page2, rows: 0 })).toEqual({ kind: 'empty' });
  expect(dataTableStatus({ ...page2, isFiltered: true, rows: 0 })).toEqual({
    kind: 'noResults',
  });
});

test('false and an empty string are not errors', () => {
  const quiet: DataTableError[] = [undefined, null, false, ''];
  expect(quiet.map((error) => hasError(error))).toEqual([
    false,
    false,
    false,
    false,
  ]);
  expect(hasError('Failed')).toBe(true);
});
