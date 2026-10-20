import {
  DataTable,
  DataTableContent,
} from '@oakoss/ui/components/ui/data/data-table';
import { currencyColumn } from '@oakoss/ui/components/ui/data/data-table-columns';
import { DataTablePagination } from '@oakoss/ui/components/ui/data/data-table-pagination';
import {
  type DataTableColumn,
  type DataTableState,
  useDataTable,
} from '@oakoss/ui/hooks/use-data-table';
import { dataTableQuery } from '@oakoss/ui/lib/data-table-query';
import { useState } from 'react';

type Order = { id: string; total: number };

const columns: DataTableColumn<Order>[] = [
  { accessorKey: 'id', header: 'Order', meta: { isRowHeader: true } },
  currencyColumn<Order>('total', { currency: 'USD', header: 'Total' }),
];

const sorts = new Map<string, (a: Order, b: Order) => number>([
  ['-id', (a, b) => b.id.localeCompare(a.id)],
  ['-total', (a, b) => b.total - a.total],
  ['id', (a, b) => a.id.localeCompare(b.id)],
  ['total', (a, b) => a.total - b.total],
]);

export function DataTableServer() {
  const [state, setState] = useState<
    Pick<DataTableState, 'pagination' | 'sorting'>
  >({ pagination: { pageIndex: 0, pageSize: 5 }, sorting: [] });
  const query = dataTableQuery({
    ...state,
    columnFilters: [],
    globalFilter: '',
  });
  const { rowCount, rows } = fetchOrders(query);
  const table = useDataTable({
    columns,
    data: rows,
    mode: 'server',
    onPaginationChange: (pagination) =>
      setState((previous) => ({ ...previous, pagination })),
    onSortingChange: (sorting) =>
      setState((previous) => ({ ...previous, sorting })),
    rowCount,
    state,
  });
  return (
    <DataTable className="not-prose w-full" table={table}>
      <DataTableContent aria-label="Orders" />
      <DataTablePagination pageSizes={[5, 10]} />
      <p className="text-sm text-muted-foreground">
        Query:{' '}
        <code>
          {new URLSearchParams({
            page: String(query.page),
            pageSize: String(query.pageSize),
            ...(query.sort !== undefined && { sort: query.sort }),
          }).toString()}
        </code>
      </p>
    </DataTable>
  );
}

// Stands in for an API: it sorts and slices 42 orders for the page asked.
function fetchOrders({
  page,
  pageSize,
  sort,
}: ReturnType<typeof dataTableQuery>) {
  const orders = Array.from({ length: 42 }, (_, index) => ({
    id: `ORD-${String(index + 1).padStart(3, '0')}`,
    total: ((index * 37) % 90) * 10 + 15,
  }));
  const compare = sorts.get(sort ?? '');
  if (compare) orders.sort(compare);
  const start = (page - 1) * pageSize;
  return {
    rowCount: orders.length,
    rows: orders.slice(start, start + pageSize),
  };
}
