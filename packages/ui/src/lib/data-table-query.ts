import type { DataTableState } from '#/hooks/use-data-table';

// `page` is 1-based and `sort` reads `amount,-createdAt` (minus for
// descending). Unset values are left out, so the query reads cleanly in a
// URL or a cache key.
export type DataTableMatch = {
  filters?: Record<string, unknown>;
  search?: string;
};

export type DataTableQuery = {
  page: number;
  pageSize: number;
  sort?: string;
} & DataTableMatch;

// The rows the filters and search match, apart from their order and page.
// Filters key by column in name order, so the same filters always compare
// and cache alike.
export function dataTableMatch(
  state: Pick<DataTableState, 'columnFilters' | 'globalFilter'>,
): DataTableMatch {
  const { columnFilters, globalFilter } = state;
  return {
    ...(columnFilters.length > 0 && {
      filters: Object.fromEntries(
        columnFilters
          .map(({ id, value }) => [id, value] as const)
          .toSorted(([a], [b]) => a.localeCompare(b)),
      ),
    }),
    ...(globalFilter.trim() !== '' && { search: globalFilter.trim() }),
  };
}

export function dataTableQuery(
  state: Pick<
    DataTableState,
    'columnFilters' | 'globalFilter' | 'pagination' | 'sorting'
  >,
): DataTableQuery {
  const { pagination, sorting } = state;
  const sort = sorting.map(({ desc, id }) => (desc ? `-${id}` : id)).join(',');
  return {
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    ...dataTableMatch(state),
    ...(sort !== '' && { sort }),
  };
}
