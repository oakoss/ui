import { expect, test } from 'vitest';

import {
  type DataTableSelection,
  isSelectionCurrent,
  nextSelection,
  noSelection,
  rowSelectionOf,
} from '#/lib/data-table-selection';

const rows = ['a', 'b', 'c'];
const allPaid: DataTableSelection = {
  all: { filters: { status: ['paid'] } },
  except: ['b'],
};

test('picked ids select themselves, loaded or not', () => {
  expect(rowSelectionOf({ ids: ['a', 'z'] }, rows)).toEqual({
    a: true,
    z: true,
  });
});

test('everything matching selects every loaded row but the excluded', () => {
  expect(rowSelectionOf(allPaid, rows)).toEqual({ a: true, c: true });
});

test('ticking a row adds its id, keeping ids not loaded', () => {
  const next = nextSelection({ ids: ['z'] }, rows, (old) => ({
    ...old,
    a: true,
  }));
  expect(next).toEqual({ ids: ['z', 'a'] });
});

test('unticking under everything matching excludes the row', () => {
  const next = nextSelection(allPaid, rows, (old) => {
    const { a: _, ...rest } = old;
    return rest;
  });
  expect(next).toEqual({ all: allPaid.all, except: ['b', 'a'] });
});

test('ticking an excluded row includes it again', () => {
  const next = nextSelection(allPaid, rows, (old) => ({ ...old, b: true }));
  expect(next).toEqual({ all: allPaid.all, except: [] });
});

test('unticking a page excludes only its rows', () => {
  const next = nextSelection({ all: {}, except: [] }, ['a', 'b'], () => ({}));
  expect(next).toEqual({ all: {}, except: ['a', 'b'] });
});

test('a value replaces picked ids', () => {
  expect(nextSelection({ ids: ['a'] }, rows, { c: true })).toEqual({
    ids: ['c'],
  });
});

// resetRowSelection and setRowSelection pass a value.
test('a value ends a selection of everything matching', () => {
  expect(nextSelection(allPaid, rows, {})).toEqual({ ids: [] });
});

// Checked by typecheck: the @ts-expect-error fails the build if it compiles.
test('a selection is ids or everything matching, never both', () => {
  // @ts-expect-error both shapes at once would select everything
  const both: DataTableSelection = { all: {}, except: [], ids: ['a'] };
  expect(both).toBeDefined();
});

test('a selection matches while its filters and search do', () => {
  expect(isSelectionCurrent(allPaid, { filters: { status: ['paid'] } })).toBe(
    true,
  );
  expect(isSelectionCurrent(allPaid, {})).toBe(false);
  expect(
    isSelectionCurrent(allPaid, { filters: { status: ['paid', 'pending'] } }),
  ).toBe(false);
  expect(
    isSelectionCurrent(allPaid, {
      filters: { status: ['paid'] },
      search: 'ada',
    }),
  ).toBe(false);
  expect(isSelectionCurrent(noSelection, { search: 'ada' })).toBe(true);
});
