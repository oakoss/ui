import type { RowData } from '@tanstack/react-table';

import {
  type DataTableInstance,
  useDataTableContext,
} from '#/hooks/use-data-table';
import { dataTableMatch } from '#/lib/data-table-query';
import {
  type DataTableSelection,
  type DataTableSelectionSummary,
  isAllMatching,
  noSelection,
  selectionTest,
  summarizeSelection,
} from '#/lib/data-table-selection';

export type { DataTableSelectionSummary } from '#/lib/data-table-selection';

// The selected rows a client table holds, for an action to act on. A server
// table's action sends the selection instead.
export function selectedRows<TData extends RowData>(
  table: DataTableInstance<TData>,
): TData[] {
  const selection = selectionOf(table);
  if (isAllMatching(selection)) {
    const isSelected = selectionTest(selection);
    return selectableRows(table)
      .filter((row) => isSelected(row.id))
      .map((row) => row.original);
  }
  // Picked rows come back in the order they were picked.
  const { rowsById } = table.getCoreRowModel();
  return selection.ids.flatMap((id) => {
    const row = rowsById[id];
    return row ? [row.original] : [];
  });
}

export function selectionSummary<TData extends RowData>(
  table: DataTableInstance<TData>,
): DataTableSelectionSummary {
  const isOff = table.options.enableRowSelection === false;
  const loaded = Object.keys(table.getCoreRowModel().rowsById);
  return summarizeSelection({
    isPageSelected: table.getIsAllPageRowsSelected(),
    selection: isOff ? noSelection : selectionOf(table),
    shownIds: selectableRows(table).map((row) => row.id),
    ...(table.options.manualFiltering === true
      ? { rowCount: table.getRowCount() }
      : { loadedIds: new Set(loaded) }),
  });
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
