import { expect, test } from 'vitest';

import {
  type DataTableSelection,
  isSelectionCurrent,
  nextSelection,
  noSelection,
  rowSelectionOf,
  selectionKey,
  selectionTest,
  summarizeSelection,
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

const client = {
  isPageSelected: false,
  loadedIds: new Set(['a', 'b', 'c', 'd', 'e']),
  shownIds: ['a', 'b'],
};

const server = { isPageSelected: false, rowCount: 40, shownIds: ['a', 'b'] };

test('a client count leaves out rows the data dropped, and notes hidden ones', () => {
  const summary = summarizeSelection({
    ...client,
    selection: { ids: ['a', 'c', 'd', 'gone'] },
  });
  expect(summary).toMatchObject({ hidden: 2, matching: 2, selected: 3 });
});

test('a server count takes picked ids as they are, and hides none', () => {
  const summary = summarizeSelection({
    ...server,
    selection: { ids: ['a', 'z'] },
  });
  expect(summary).toMatchObject({ hidden: 0, matching: 40, selected: 2 });
});

test('everything matching counts the total less the unticked', () => {
  expect(
    summarizeSelection({ ...server, selection: { all: {}, except: ['a'] } }),
  ).toMatchObject({ isEverything: false, selected: 39 });
  expect(
    summarizeSelection({ ...client, selection: { all: {}, except: [] } }),
  ).toMatchObject({ isEverything: true, selected: 2 });
  expect(
    summarizeSelection({ ...client, selection: { all: {}, except: ['a'] } }),
  ).toMatchObject({ isEverything: false, selected: 1 });
});

test('a server count takes each unticked row once, and never below 0', () => {
  const twice = { all: {}, except: ['a', 'a'] };
  expect(summarizeSelection({ ...server, selection: twice }).selected).toBe(39);
  const more = { all: {}, except: ['a', 'b'] };
  expect(
    summarizeSelection({ ...server, rowCount: 1, selection: more }).selected,
  ).toBe(0);
});

test('unticking every row keeps the mode but nothing is everything', () => {
  const summary = summarizeSelection({
    ...client,
    selection: { all: {}, except: ['a', 'b'] },
  });
  expect(summary).toMatchObject({
    isAllMatching: true,
    isEverything: false,
    selected: 0,
  });
});

test('select all is offered past selected rows a filter hides', () => {
  const picked = { ids: ['a', 'b', 'c', 'd'] };
  expect(
    summarizeSelection({ ...client, isPageSelected: true, selection: picked }),
  ).toMatchObject({ canSelectAll: false, hidden: 2 });
  const more = { ...client, shownIds: ['a', 'b', 'e'] };
  expect(
    summarizeSelection({ ...more, isPageSelected: true, selection: picked })
      .canSelectAll,
  ).toBe(true);
});

test('select all waits for a full page, and not when all already are', () => {
  const more = { ...client, shownIds: ['a', 'b', 'e'] };
  expect(
    summarizeSelection({ ...more, selection: { ids: ['a', 'b'] } })
      .canSelectAll,
  ).toBe(false);
  expect(
    summarizeSelection({
      ...more,
      isPageSelected: true,
      selection: { all: {}, except: ['e'] },
    }).canSelectAll,
  ).toBe(false);
});

// Checked by typecheck: the @ts-expect-error fails the build if it compiles.
test('a summary is for a client or a server table, never both', () => {
  // @ts-expect-error a server table that passes no total would count its page
  const unknown = summarizeSelection({
    ...server,
    rowCount: undefined,
    selection: noSelection,
  });
  const neither = summarizeSelection(
    // @ts-expect-error neither the loaded rows nor a total
    { isPageSelected: false, selection: noSelection, shownIds: [] },
  );
  // @ts-expect-error both a client's rows and a server's total
  const both = summarizeSelection({
    ...client,
    rowCount: 1,
    selection: noSelection,
  });
  expect([unknown, neither, both]).toHaveLength(3);
});

test('a selection reads the same whatever order its keys came in', () => {
  const ordered = selectionKey({
    all: { filters: { a: 1, b: 2 }, search: 'x' },
    except: ['z'],
  });
  // Spreads put each key after the ones before it, out of name order.
  const except = { except: ['z'] };
  const search = { search: 'x' };
  const b = { b: 2 };
  const shuffled = selectionKey({
    ...except,
    all: { ...search, filters: { ...b, a: 1 } },
  });
  expect(shuffled).toBe(ordered);
  expect(selectionKey({ ids: ['a'] })).not.toBe(selectionKey({ ids: ['b'] }));
});

test('a row is in the selection by id, or by not being unticked', () => {
  expect(selectionTest({ ids: ['a'] })('a')).toBe(true);
  expect(selectionTest({ ids: ['a'] })('b')).toBe(false);
  expect(selectionTest(allPaid)('b')).toBe(false);
  expect(selectionTest(allPaid)('c')).toBe(true);
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

test('a filter value restored in another key order still matches', () => {
  const max = { max: 5 };
  const range: DataTableSelection = {
    all: { filters: { amount: { min: 1, ...max } } },
    except: [],
  };
  const restored = { filters: { amount: { ...max, min: 1 } } };
  expect(isSelectionCurrent(range, restored)).toBe(true);
});
