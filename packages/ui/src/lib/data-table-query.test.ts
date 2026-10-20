import { expect, test } from 'vitest';

import { dataTableQuery } from '#/lib/data-table-query';

const base = {
  columnFilters: [],
  globalFilter: '',
  pagination: { pageIndex: 0, pageSize: 10 },
  sorting: [],
};

test('an untouched table asks for its first page only', () => {
  expect(dataTableQuery(base)).toEqual({ page: 1, pageSize: 10 });
});

test('pages count from 1', () => {
  const pagination = { pageIndex: 2, pageSize: 25 };
  expect(dataTableQuery({ ...base, pagination })).toMatchObject({
    page: 3,
    pageSize: 25,
  });
});

test('sort lists columns in order, descending ones marked with a minus', () => {
  const sorting = [
    { desc: false, id: 'status' },
    { desc: true, id: 'amount' },
  ];
  expect(dataTableQuery({ ...base, sorting }).sort).toBe('status,-amount');
});

test('filters key each value by its column', () => {
  const columnFilters = [
    { id: 'status', value: ['paid'] },
    { id: 'amount', value: [100, 500] },
  ];
  expect(dataTableQuery({ ...base, columnFilters }).filters).toEqual({
    amount: [100, 500],
    status: ['paid'],
  });
});

test('search is trimmed, and blank search is left out', () => {
  expect(dataTableQuery({ ...base, globalFilter: '  ada ' }).search).toBe(
    'ada',
  );
  expect(
    dataTableQuery({ ...base, globalFilter: ' '.repeat(3) }),
  ).not.toHaveProperty('search');
});
