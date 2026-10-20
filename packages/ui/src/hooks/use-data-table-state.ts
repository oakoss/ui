import type {
  ColumnFiltersState,
  ColumnVisibilityState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
} from '@tanstack/react-table';

import { useLayoutEffect, useRef, useState } from 'react';

export type DataTableChangeHandlers = {
  [K in keyof DataTableState as `on${Capitalize<K>}Change`]?: (
    value: DataTableState[K],
  ) => void;
};

export type DataTableState = {
  columnFilters: ColumnFiltersState;
  columnVisibility: ColumnVisibilityState;
  globalFilter: string;
  pagination: PaginationState;
  rowSelection: RowSelectionState;
  sorting: SortingState;
};

type SliceOptions = {
  defaultState?: Partial<DataTableState>;
  state?: Partial<DataTableState>;
} & DataTableChangeHandlers;

const initialState: DataTableState = {
  columnFilters: [],
  columnVisibility: {},
  globalFilter: '',
  pagination: { pageIndex: 0, pageSize: 10 },
  rowSelection: {},
  sorting: [],
};

// Each slice is the consumer's when they pass it in `state`, and the hook's
// own otherwise; either way their change handler hears the new value.
export function useDataTableState(options: SliceOptions) {
  const [own, setOwn] = useState<DataTableState>(() => ({
    ...initialState,
    ...options.defaultState,
  }));
  const state = withControlled(own, options.state);
  const { toFirstPage, update } = useUpdate(
    state,
    setOwn,
    options.onPaginationChange,
  );
  const handlers = {
    onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) => {
      update('columnFilters', updater, options.onColumnFiltersChange);
      toFirstPage();
    },
    onColumnVisibilityChange: (updater: Updater<ColumnVisibilityState>) =>
      update('columnVisibility', updater, options.onColumnVisibilityChange),
    onGlobalFilterChange: (updater: Updater<string>) => {
      update('globalFilter', updater, options.onGlobalFilterChange);
      toFirstPage();
    },
    onPaginationChange: (updater: Updater<PaginationState>) =>
      update('pagination', updater, options.onPaginationChange),
    onRowSelectionChange: (updater: Updater<RowSelectionState>) =>
      update('rowSelection', updater, options.onRowSelectionChange),
    onSortingChange: (updater: Updater<SortingState>) => {
      update('sorting', updater, options.onSortingChange);
      toFirstPage();
    },
  };
  return { handlers, state };
}

// Several changes in one event each build on the one before, not on the last
// render. The ref syncs in a layout effect, ahead of the parts' effects.
function useUpdate(
  state: DataTableState,
  setOwn: (update: (own: DataTableState) => DataTableState) => void,
  onPaginationChange: DataTableChangeHandlers['onPaginationChange'],
) {
  const latest = useRef(state);
  useLayoutEffect(() => {
    latest.current = state;
  });

  function update<K extends keyof DataTableState>(
    key: K,
    updater: Updater<DataTableState[K]>,
    onChange: ((value: DataTableState[K]) => void) | undefined,
  ) {
    const previous = latest.current[key];
    const next = typeof updater === 'function' ? updater(previous) : updater;
    latest.current = { ...latest.current, [key]: next };
    setOwn((own) => ({ ...own, [key]: next }));
    onChange?.(next);
  }

  // A new order or filter shows its first page. TanStack's own reset waits a
  // tick and fires on every data change too, so the table turns it off.
  function toFirstPage() {
    const { pagination } = latest.current;
    if (pagination.pageIndex === 0) return;
    update('pagination', { ...pagination, pageIndex: 0 }, onPaginationChange);
  }

  return { toFirstPage, update };
}

function withControlled(
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
