import type {
  ColumnFiltersState,
  ColumnVisibilityState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
} from '@tanstack/react-table';

import { useLayoutEffect, useRef, useState } from 'react';

import {
  type DataTableState,
  firstPageAfter,
  initialDataTableState,
  nextDataTableState,
  withControlled,
} from '#/lib/data-table-state';

export type { DataTableState } from '#/lib/data-table-state';

export type DataTableChangeHandlers = {
  [K in keyof DataTableState as `on${Capitalize<K>}Change`]?: (
    value: DataTableState[K],
  ) => void;
};

type SliceOptions = {
  defaultState?: Partial<DataTableState>;
  state?: Partial<DataTableState>;
} & DataTableChangeHandlers;

// Each slice is the consumer's when they pass it in `state`, and the hook's
// own otherwise; either way their change handler hears the new value.
export function useDataTableState(options: SliceOptions) {
  const [own, setOwn] = useState<DataTableState>(() => ({
    ...initialDataTableState,
    ...options.defaultState,
  }));
  const state = withControlled(own, options.state);
  const update = useUpdate(state, setOwn, options.onPaginationChange);
  const handlers = {
    onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) =>
      update('columnFilters', updater, options.onColumnFiltersChange),
    onColumnVisibilityChange: (updater: Updater<ColumnVisibilityState>) =>
      update('columnVisibility', updater, options.onColumnVisibilityChange),
    // TanStack's reset clears it to undefined; an empty string means the same.
    onGlobalFilterChange: (updater: Updater<string | undefined>) =>
      update(
        'globalFilter',
        (previous) =>
          (typeof updater === 'function' ? updater(previous) : updater) ?? '',
        options.onGlobalFilterChange,
      ),
    onPaginationChange: (updater: Updater<PaginationState>) =>
      update('pagination', updater, options.onPaginationChange),
    onRowSelectionChange: (updater: Updater<RowSelectionState>) =>
      update('rowSelection', updater, options.onRowSelectionChange),
    onSortingChange: (updater: Updater<SortingState>) =>
      update('sorting', updater, options.onSortingChange),
  };
  return { handlers, state };
}

// Several changes in one event each build on the one before, not on the last
// render. The ref syncs in a layout effect, ahead of the parts' effects.
// TanStack's own page reset waits a tick and fires on every data change too,
// so the table turns it off and resets here.
function useUpdate(
  state: DataTableState,
  setOwn: (update: (own: DataTableState) => DataTableState) => void,
  onPaginationChange: DataTableChangeHandlers['onPaginationChange'],
) {
  const latest = useRef(state);
  useLayoutEffect(() => {
    latest.current = state;
  });

  function apply<K extends keyof DataTableState>(
    key: K,
    value: DataTableState[K],
    onChange: ((value: DataTableState[K]) => void) | undefined,
  ) {
    latest.current = { ...latest.current, [key]: value };
    setOwn((own) => ({ ...own, [key]: value }));
    onChange?.(value);
  }

  // The reset reads the state after `onChange`, which may have changed the
  // pagination itself.
  return function update<K extends keyof DataTableState>(
    key: K,
    updater: Updater<DataTableState[K]>,
    onChange: ((value: DataTableState[K]) => void) | undefined,
  ) {
    apply(key, nextDataTableState(latest.current, key, updater)[key], onChange);
    const pagination = firstPageAfter(latest.current, key);
    if (pagination) apply('pagination', pagination, onPaginationChange);
  };
}
