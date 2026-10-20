import type {
  ColumnFiltersState,
  ColumnVisibilityState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
} from '@tanstack/react-table';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useLatest } from '#/hooks/use-latest';
import {
  type DataTableSelection,
  nextSelection,
  noSelection,
  selectionKey,
} from '#/lib/data-table-selection';
import {
  type DataTableState,
  firstPageAfter,
  initialDataTableState,
  isSelectionStale,
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
// `rowIds` are the loaded rows', which TanStack's selection covers.
export function useDataTableState(
  options: SliceOptions,
  rowIds: readonly string[],
) {
  const [own, setOwn] = useState<DataTableState>(() => ({
    ...initialDataTableState,
    ...options.defaultState,
  }));
  const controlled = withControlled(own, options.state);
  // Filters the app changed itself end a stale selection too: hidden at once,
  // then ended through onSelectionChange, so once applied, restoring the
  // filters can't bring it back.
  const isStale = isSelectionStale(controlled);
  const state = isStale
    ? { ...controlled, selection: noSelection }
    : controlled;
  const update = useUpdate(
    state,
    setOwn,
    options,
    isStale ? controlled.selection : null,
  );
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
      update(
        'selection',
        (previous) => nextSelection(previous, rowIds, updater),
        options.onSelectionChange,
      ),
    onSelectionChange: (updater: Updater<DataTableState['selection']>) =>
      update('selection', updater, options.onSelectionChange),
    onSortingChange: (updater: Updater<SortingState>) =>
      update('sorting', updater, options.onSortingChange),
  };
  return { handlers, state };
}

// Several changes in one event each build on the one before, not on the last
// render. The ref syncs in a layout effect, ahead of the parts' effects.
// TanStack's own page reset waits a tick and fires on every data change too,
// so the table turns it off and resets here. A `stale` selection the app's
// own filters ended is ended once, after render; `ended` remembers it by
// value, so an app applying the end late or rebuilding the selection each
// render doesn't hear it again. The effect runs every commit, so a current
// selection clears `ended` even after a render that was current too.
function useUpdate(
  state: DataTableState,
  setOwn: (update: (own: DataTableState) => DataTableState) => void,
  {
    onPaginationChange,
    onSelectionChange,
  }: Pick<DataTableChangeHandlers, 'onPaginationChange' | 'onSelectionChange'>,
  stale: DataTableSelection | null,
) {
  const latest = useRef(state);
  const ended = useRef<string>(null);
  useLayoutEffect(() => {
    latest.current = state;
  });
  const staleKey = stale === null ? null : selectionKey(stale);
  const endRef = useLatest(() => {
    ended.current = staleKey;
    apply('selection', noSelection, onSelectionChange);
  });
  useEffect(() => {
    if (staleKey === null) ended.current = null;
    else if (staleKey !== ended.current) endRef.current();
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

  // The resets read the state after `onChange`, which may have changed the
  // pagination or selection itself.
  return function update<K extends keyof DataTableState>(
    key: K,
    updater: Updater<DataTableState[K]>,
    onChange: ((value: DataTableState[K]) => void) | undefined,
  ) {
    apply(key, nextDataTableState(latest.current, key, updater)[key], onChange);
    const pagination = firstPageAfter(latest.current, key);
    if (pagination) apply('pagination', pagination, onPaginationChange);
    if (!isSelectionStale(latest.current)) return;
    ended.current = selectionKey(latest.current.selection);
    apply('selection', noSelection, onSelectionChange);
  };
}
