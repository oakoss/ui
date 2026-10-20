import type { RowSelectionState, Updater } from '@tanstack/react-table';

import type { DataTableMatch } from '#/lib/data-table-query';

// Rows picked by id, or every row matching the filters and search they were
// picked under, except the ones unticked since.
export type DataTableSelection = AllMatching | PickedIds;

type AllMatching = {
  all: DataTableMatch;
  except: readonly string[];
  ids?: never;
};

type PickedIds = { all?: never; except?: never; ids: readonly string[] };

export const noSelection: DataTableSelection = { ids: [] };

export type DataTableSelectionSummary = {
  // Offer to select every matching row: the page is all ticked and more rows
  // match than the selected ones the filters show.
  canSelectAll: boolean;
  // Selected rows a filter hides. Always 0 on a server table, which can't
  // tell a filtered-out row from one on another page.
  hidden: number;
  isAllMatching: boolean;
  isEverything: boolean;
  matching: number;
  selected: number;
};

// A client table holds every row and counts its shown ones; a server table
// gives its total and holds only the page.
type SummaryInput = {
  isPageSelected: boolean;
  selection: DataTableSelection;
  // Ids of the selectable rows the filters show.
  shownIds: readonly string[];
} & (
  | { loadedIds: ReadonlySet<string>; rowCount?: never }
  | { loadedIds?: never; rowCount: number }
);

export function isAllMatching(
  selection: DataTableSelection,
): selection is AllMatching {
  return selection.all !== undefined;
}

// A new filter or search ends a selection of everything matching the old
// one; picked ids stay.
export function isSelectionCurrent(
  selection: DataTableSelection,
  match: DataTableMatch,
) {
  return !isAllMatching(selection) || isSameMatch(selection.all, match);
}

// A TanStack selection update as a change to the selection. Rows, Shift
// ranges and the page box pass a function; a value, as from
// resetRowSelection, replaces the selection.
export function nextSelection(
  selection: DataTableSelection,
  rowIds: readonly string[],
  updater: Updater<RowSelectionState>,
): DataTableSelection {
  if (typeof updater !== 'function') return { ids: picked(updater) };
  const after = updater(rowSelectionOf(selection, rowIds));
  if (!isAllMatching(selection)) return { ids: picked(after) };
  const except = new Set(selection.except);
  for (const id of rowIds) {
    if (after[id] === true) except.delete(id);
    else except.add(id);
  }
  return { all: selection.all, except: [...except] };
}

// TanStack's selection for the loaded rows. Every loaded row counts as
// matching: filtered-out rows never show, and a filter change ends the mode.
export function rowSelectionOf(
  selection: DataTableSelection,
  rowIds: readonly string[],
): RowSelectionState {
  const isPicked = selectionTest(selection);
  const ids = isAllMatching(selection)
    ? rowIds.filter((id) => isPicked(id))
    : selection.ids;
  return Object.fromEntries(ids.map((id) => [id, true]));
}

// The selection as text, the same whatever order its object keys came in.
export function selectionKey(selection: DataTableSelection) {
  return stableJson(selection);
}

// Whether a row is in the selection, for a row the caller knows matches
// when everything matching is selected.
export function selectionTest(
  selection: DataTableSelection,
): (id: string) => boolean {
  if (isAllMatching(selection)) {
    const except = new Set(selection.except);
    return (id) => !except.has(id);
  }
  const ids = new Set(selection.ids);
  return (id) => ids.has(id);
}

// One reading of the selection for every part, so counts can't disagree.
export function summarizeSelection(
  input: SummaryInput,
): DataTableSelectionSummary {
  const { isPageSelected, selection, shownIds } = input;
  // The one check for a server table: it passes no loaded rows.
  const loaded = input.loadedIds;
  const total = loaded === undefined ? input.rowCount : undefined;
  const matching = total ?? shownIds.length;
  const isAll = isAllMatching(selection);
  // A client table holds every row, so an id it lacks is a row that's gone.
  const picked = isAll
    ? []
    : selection.ids.filter((id) => loaded === undefined || loaded.has(id));
  const selected = isAll
    ? countAllMatching(selection, shownIds, total)
    : picked.length;
  const shown = new Set(shownIds);
  const hidden =
    loaded === undefined ? 0 : picked.filter((id) => !shown.has(id)).length;
  return {
    canSelectAll: !isAll && isPageSelected && matching > selected - hidden,
    hidden,
    isAllMatching: isAll,
    isEverything: isAll && selected === matching,
    matching,
    selected,
  };
}

function countAllMatching(
  selection: AllMatching,
  shownIds: readonly string[],
  rowCount: number | undefined,
) {
  if (rowCount !== undefined) {
    return Math.max(rowCount - new Set(selection.except).size, 0);
  }
  const isPicked = selectionTest(selection);
  return shownIds.filter((id) => isPicked(id)).length;
}

// A filter value restored from a URL can come back with its keys in another
// order, such as a range's min and max.
function isSameMatch(a: DataTableMatch, b: DataTableMatch) {
  return stableJson(a) === stableJson(b);
}

function picked(selection: RowSelectionState) {
  return Object.keys(selection).filter((id) => selection[id] === true);
}

function stableJson(value: unknown) {
  return JSON.stringify(value, (_key, part: unknown) =>
    part !== null && typeof part === 'object' && !Array.isArray(part)
      ? Object.fromEntries(
          Object.entries(part).toSorted(([a], [b]) => a.localeCompare(b)),
        )
      : part,
  );
}
