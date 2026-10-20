import type { RowData } from '@tanstack/react-table';

import {
  type DataTableInstance,
  useDataTableContext,
} from '#/hooks/use-data-table';
import { dataTableMatch } from '#/lib/data-table-query';
import {
  type DataTableSelection,
  isAllMatching,
  noSelection,
} from '#/lib/data-table-selection';

export type DataTableSelectionSummary = {
  // Selected rows a filter hides. Client tables only: a server table can't
  // tell a filtered-out row from one on another page.
  hidden: number;
  isAllMatching: boolean;
  isPageSelected: boolean;
  matching: number;
  selected: number;
};

// The selected rows a client table holds, for an action to act on. A server
// table's action sends the selection instead.
export function selectedRows<TData extends RowData>(
  table: DataTableInstance<TData>,
): TData[] {
  const selection = selectionOf(table);
  if (isAllMatching(selection)) {
    const except = new Set(selection.except);
    return selectableRows(table)
      .filter((row) => !except.has(row.id))
      .map((row) => row.original);
  }
  const { rowsById } = table.getCoreRowModel();
  return selection.ids.flatMap((id) => {
    const row = rowsById[id];
    return row ? [row.original] : [];
  });
}

// One reading of the selection for every part, so counts can't disagree.
export function selectionSummary<TData extends RowData>(
  table: DataTableInstance<TData>,
): DataTableSelectionSummary {
  const selection = selectionOf(table);
  const isServer = table.options.manualFiltering === true;
  const rows = selectableRows(table);
  const matching = isServer ? table.getRowCount() : rows.length;
  const none = {
    hidden: 0,
    isAllMatching: false,
    isPageSelected: false,
    matching,
    selected: 0,
  };
  if (table.options.enableRowSelection === false) return none;
  const isPageSelected = table.getIsAllPageRowsSelected();
  if (isAllMatching(selection)) {
    const except = new Set(selection.except);
    const selected = isServer
      ? Math.max(matching - except.size, 0)
      : rows.filter((row) => !except.has(row.id)).length;
    return { ...none, isAllMatching: true, isPageSelected, selected };
  }
  const shown = new Set(rows.map((row) => row.id));
  const loaded = table.getCoreRowModel().rowsById;
  // A client table holds every row, so an id it lacks is a row that's gone;
  // a server table's other pages aren't loaded.
  const ids = isServer
    ? selection.ids
    : selection.ids.filter((id) => Object.hasOwn(loaded, id));
  return {
    ...none,
    hidden: ids.filter((id) => !isServer && !shown.has(id)).length,
    isPageSelected,
    selected: ids.length,
  };
}

export function useDataTableSelection() {
  const table = useDataTableContext();
  const { onSelectionChange } = metaOf(table);
  return {
    ...selectionSummary(table),
    clear: () => onSelectionChange(noSelection),
    selectAllMatching: () =>
      onSelectionChange({ all: dataTableMatch(table.state), except: [] }),
    selection: selectionOf(table),
  };
}

function metaOf<TData extends RowData>(table: DataTableInstance<TData>) {
  const { meta } = table.options;
  if (meta === undefined) {
    throw new Error('Data table parts need a table from useDataTable.');
  }
  return meta;
}

function selectableRows<TData extends RowData>(
  table: DataTableInstance<TData>,
) {
  return table.getFilteredRowModel().rows.filter((row) => row.getCanSelect());
}

function selectionOf<TData extends RowData>(
  table: DataTableInstance<TData>,
): DataTableSelection {
  return metaOf(table).selection;
}
