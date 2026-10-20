import type {
  ColumnFiltersState,
  ColumnVisibilityState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
} from '@tanstack/react-table';

export type DataTableState = {
  columnFilters: ColumnFiltersState;
  columnVisibility: ColumnVisibilityState;
  globalFilter: string;
  pagination: PaginationState;
  rowSelection: RowSelectionState;
  sorting: SortingState;
};

export const initialDataTableState: DataTableState = {
  columnFilters: [],
  columnVisibility: {},
  globalFilter: '',
  pagination: { pageIndex: 0, pageSize: 10 },
  rowSelection: {},
  sorting: [],
};

const resetsPage = new Set<keyof DataTableState>([
  'columnFilters',
  'globalFilter',
  'sorting',
]);

// A new order or filter shows its first page.
export function firstPageAfter(
  state: DataTableState,
  key: keyof DataTableState,
): PaginationState | undefined {
  return resetsPage.has(key) && state.pagination.pageIndex !== 0
    ? { ...state.pagination, pageIndex: 0 }
    : undefined;
}

export function nextDataTableState<K extends keyof DataTableState>(
  state: DataTableState,
  key: K,
  updater: Updater<DataTableState[K]>,
): DataTableState {
  const value = typeof updater === 'function' ? updater(state[key]) : updater;
  const next = { ...state, [key]: value };
  const pagination = firstPageAfter(state, key);
  return pagination ? { ...next, pagination } : next;
}

export function withControlled(
  own: DataTableState,
  controlled: Partial<DataTableState> = {},
): DataTableState {
  return {
    columnFilters: controlled.columnFilters ?? own.columnFilters,
    columnVisibility: controlled.columnVisibility ?? own.columnVisibility,
    globalFilter: controlled.globalFilter ?? own.globalFilter,
    pagination: controlled.pagination ?? own.pagination,
    rowSelection: controlled.rowSelection ?? own.rowSelection,
    sorting: controlled.sorting ?? own.sorting,
  };
}
