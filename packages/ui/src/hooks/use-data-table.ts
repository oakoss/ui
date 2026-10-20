import {
  type CellData,
  type Column,
  type ColumnDef,
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  constructFilterFn,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrHas,
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
  type RowSelectionState,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { createContext, type ReactNode, use, useEffect, useMemo } from 'react';

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
  // The values a faceted filter offers, in order. A column with options
  // keeps rows whose value equals a picked one, unless it names its own
  // filterFn, which receives the picked values as strings.
  options?: readonly DataTableOption[];
};

export type DataTableOption = {
  icon?: ReactNode;
  label: string;
  value: string;
};

// Options are strings, so values compare as strings, and a missing value
// matches none. A single value, as a URL might restore, counts as one pick,
// and stays set when another filter changes.
const filterFn_inOptions = constructFilterFn({
  ...filterFn_arrHas,
  autoRemove: (value: unknown) =>
    value === '' || optionValues(value).length === 0,
  resolveDataValue: valueText,
  resolveFilterValue: optionValues,
});

export const dataTableFeatures = tableFeatures({
  columnFacetingFeature,
  columnFilteringFeature,
  columnMeta: metaHelper<DataTableColumnMeta>(),
  columnVisibilityFeature,
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filteredRowModel: createFilteredRowModel(),
  // The functions TanStack picks for a column's value type, and inOptions
  // for a column with options.
  filterFns: {
    arrIncludes: filterFn_arrIncludes,
    equals: filterFn_equals,
    includesString: filterFn_includesString,
    inDateRange: filterFn_inDateRange,
    inNumberRange: filterFn_inNumberRange,
    inOptions: filterFn_inOptions,
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

export function optionValues(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  return (Array.isArray(value) ? value : [value]).map(
    (part) => valueText(part) ?? '',
  );
}

// The page to show and the page count, each at least 1. A server table can
// sit past its total while a failed or shrunk page loads.
export function pageOf(table: DataTableInstance<RowData>) {
  const pageCount = Math.max(table.getPageCount(), 1);
  const page = Math.min(table.state.pagination.pageIndex + 1, pageCount);
  return { page, pageCount };
}

// Selection kept in state while selecting is off isn't a selection.
export function selectedCount(table: {
  options: { enableRowSelection?: unknown };
  state: { rowSelection: RowSelectionState };
}) {
  return table.options.enableRowSelection === false
    ? 0
    : Object.keys(table.state.rowSelection).length;
}

export function useDataTable<TData extends RowData>(
  options: UseDataTableOptions<TData>,
): DataTableInstance<TData> {
  const { handlers, state } = useDataTableState(options);
  const isServer = options.mode === 'server';
  const columns = useMemo(
    () => options.columns.map((column) => withOptionsFilter(column)),
    [options.columns],
  );
  const table = useTable({
    ...handlers,
    autoResetPageIndex: false,
    columns,
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

export function valueText(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') return value;
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }
  return JSON.stringify(value);
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
// a failure or an empty filter, which keeps the page. A negative page is
// never valid.
function usePageInRange<TData extends RowData>(
  table: DataTableInstance<TData>,
  isServer: boolean,
) {
  const tableRef = useLatest(table);
  const { pageIndex } = table.state.pagination;
  const pageCount = table.getPageCount();
  useEffect(() => {
    // Both build on the latest page, which a linked row may have moved this
    // commit.
    if (pageIndex < 0)
      tableRef.current.setPageIndex((index) => Math.max(index, 0));
    else if (!isServer && pageCount > 0 && pageIndex >= pageCount) {
      tableRef.current.setPageIndex((index) => Math.min(index, pageCount - 1));
    }
  }, [isServer, pageCount, pageIndex, tableRef]);
}

// TanStack picks a text filter for text values, which would match "paid"
// inside "unpaid"; a faceted filter's values match exactly.
function withOptionsFilter<TData extends RowData>(
  column: DataTableColumn<TData>,
): DataTableColumn<TData> {
  if ('columns' in column && column.columns !== undefined) {
    return { ...column, columns: column.columns.map(withOptionsFilter) };
  }
  return column.meta?.options === undefined || column.filterFn !== undefined
    ? column
    : { ...column, filterFn: 'inOptions' };
}
