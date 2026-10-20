import type { DataTableState } from '#/hooks/use-data-table';

// `page` is 1-based and `sort` reads `amount,-createdAt` (minus for
// descending). Unset values are left out, so the query reads cleanly in a
// URL or a cache key.
export type DataTableQuery = {
  filters?: Record<string, unknown>;
  page: number;
  pageSize: number;
  search?: string;
  sort?: string;
};

export function dataTableQuery(
  state: Pick<
    DataTableState,
    'columnFilters' | 'globalFilter' | 'pagination' | 'sorting'
  >,
): DataTableQuery {
  const { columnFilters, globalFilter, pagination, sorting } = state;
  const sort = sorting.map(({ desc, id }) => (desc ? `-${id}` : id)).join(',');
  return {
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    ...(columnFilters.length > 0 && {
      filters: Object.fromEntries(
        columnFilters.map(({ id, value }) => [id, value]),
      ),
    }),
    ...(globalFilter.trim() !== '' && { search: globalFilter.trim() }),
    ...(sort !== '' && { sort }),
  };
}
