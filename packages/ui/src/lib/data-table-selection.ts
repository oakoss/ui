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
  if (!isAllMatching(selection)) {
    return Object.fromEntries(selection.ids.map((id) => [id, true]));
  }
  const except = new Set(selection.except);
  return Object.fromEntries(
    rowIds.filter((id) => !except.has(id)).map((id) => [id, true]),
  );
}

function isSameMatch(a: DataTableMatch, b: DataTableMatch) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function picked(selection: RowSelectionState) {
  return Object.keys(selection).filter((id) => selection[id] === true);
}
