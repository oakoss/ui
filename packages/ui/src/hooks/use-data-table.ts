import {
  type CellData,
  type Column,
  type ColumnDef,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrIncludes,
  filterFn_equals,
  filterFn_includesString,
  filterFn_inDateRange,
  filterFn_inNumberRange,
  globalFilteringFeature,
  metaHelper,
  type ReactTable,
  type Row,
  type RowData,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { createContext, use, useEffect } from 'react';

import {
  type DataTableChangeHandlers,
  type DataTableState,
  useDataTableState,
} from '#/hooks/use-data-table-state';
import { useLatest } from '#/hooks/use-latest';

export type { DataTableState } from '#/hooks/use-data-table-state';

export type DataTableColumnMeta = {
  align?: 'center' | 'end' | 'start';
  className?: string;
  isRowHeader?: boolean;
  label?: string;
};

export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnMeta: metaHelper<DataTableColumnMeta>(),
  columnVisibilityFeature,
  filteredRowModel: createFilteredRowModel(),
  // The functions TanStack picks for a column's value type.
  filterFns: {
    arrIncludes: filterFn_arrIncludes,
    equals: filterFn_equals,
    includesString: filterFn_includesString,
    inDateRange: filterFn_inDateRange,
    inNumberRange: filterFn_inNumberRange,
  },
  globalFilteringFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

// A table's row type can't widen to a general one, so the context holds it
// as unknown and parts read it back through a guard.
export const DataTableContext = createContext<unknown>(null);

export type DataTableColumn<
  TData extends RowData,
  TValue extends CellData = CellData,
> = ColumnDef<DataTableFeatures, TData, TValue>;

export type DataTableFeatures = typeof dataTableFeatures;

export type DataTableInstance<TData extends RowData> = ReactTable<
  DataTableFeatures,
  TData
>;

export type UseDataTableOptions<TData extends RowData> = {
  columns: DataTableColumn<TData>[];
  data: TData[];
  defaultState?: Partial<DataTableState>;
  state?: Partial<DataTableState>;
} & DataTableChangeHandlers &
  ModeOptions &
  SelectionOptions<TData>;

// Server pages need the total to page through, so the type asks for it.
type ModeOptions =
  | { mode: 'server'; rowCount: number }
  | { mode?: 'client'; rowCount?: never };

// Selection is kept by row id, and index ids point at other rows once the
// data sorts, filters or pages, so selecting needs the data's own ids.
type SelectionOptions<TData extends RowData> =
  | {
      enableRowSelection:
        | ((row: Row<DataTableFeatures, TData>) => boolean)
        | boolean;
      getRowId: (row: TData, index: number) => string;
    }
  | {
      enableRowSelection?: false;
      getRowId?: (row: TData, index: number) => string;
    };

export function columnLabel(
  column: Column<DataTableFeatures, RowData>,
): string {
  const { header, meta } = column.columnDef;
  return meta?.label ?? (typeof header === 'string' ? header : column.id);
}

export function defaultPageLabel(page: number, pageCount: number) {
  return `Page ${String(page)} of ${String(pageCount)}`;
}

// The page to show and the page count, each at least 1. A server table can
// sit past its total while a failed or shrunk page loads.
export function pageOf(table: DataTableInstance<RowData>) {
  const pageCount = Math.max(table.getPageCount(), 1);
  const page = Math.min(table.state.pagination.pageIndex + 1, pageCount);
  return { page, pageCount };
}

export function selectedCount(table: DataTableInstance<RowData>) {
  return Object.keys(table.state.rowSelection).length;
}

export function useDataTable<TData extends RowData>(
  options: UseDataTableOptions<TData>,
): DataTableInstance<TData> {
  const { handlers, state } = useDataTableState(options);
  const isServer = options.mode === 'server';
  const table = useTable({
    ...handlers,
    autoResetPageIndex: false,
    columns: options.columns,
    data: options.data,
    enableRowSelection: options.enableRowSelection ?? false,
    features: dataTableFeatures,
    getRowId: options.getRowId,
    manualFiltering: isServer,
    manualPagination: isServer,
    manualSorting: isServer,
    rowCount: options.mode === 'server' ? options.rowCount : undefined,
    sortDescFirst: false,
    state,
  });
  usePageInRange(table, isServer);
  return table;
}

export function useDataTableContext(): DataTableInstance<RowData> {
  const table = use(DataTableContext);
  if (!isDataTable(table)) {
    throw new Error('Data table parts render inside a DataTable.');
  }
  return table;
}

function isDataTable(value: unknown): value is DataTableInstance<RowData> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'state' in value &&
    typeof value.state === 'object' &&
    value.state !== null &&
    'pagination' in value.state &&
    'rowSelection' in value.state
  );
}

// Rows removed from under the last page leave the client table past its end,
// so it steps back to the last page that has rows. No rows at all is a load,
// a failure or an empty filter, which keeps the page.
function usePageInRange<TData extends RowData>(
  table: DataTableInstance<TData>,
  isServer: boolean,
) {
  const tableRef = useLatest(table);
  const { pageIndex } = table.state.pagination;
  const pageCount = table.getPageCount();
  useEffect(() => {
    if (!isServer && pageCount > 0 && pageIndex >= pageCount) {
      tableRef.current.setPageIndex(pageCount - 1);
    }
  }, [isServer, pageCount, pageIndex, tableRef]);
}
