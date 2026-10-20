import {
  DataTable,
  DataTableContent,
  DataTableToolbar,
} from '@oakoss/ui/components/ui/data/data-table';
import { currencyColumn } from '@oakoss/ui/components/ui/data/data-table-columns';
import { DataTableFacetedFilter } from '@oakoss/ui/components/ui/data/data-table-faceted-filter';
import { DataTableFilterChips } from '@oakoss/ui/components/ui/data/data-table-filter-chips';
import { DataTablePagination } from '@oakoss/ui/components/ui/data/data-table-pagination';
import { DataTableSearch } from '@oakoss/ui/components/ui/data/data-table-search';
import {
  type DataTableColumn,
  useDataTable,
} from '@oakoss/ui/hooks/use-data-table';

type Order = { customer: string; id: string; status: string; total: number };

const orders: Order[] = [
  ['ORD-001', 'Ada Lovelace', 'shipped', 120],
  ['ORD-002', 'Grace Hopper', 'processing', 80],
  ['ORD-003', 'Alan Turing', 'cancelled', 45],
  ['ORD-004', 'Katherine Johnson', 'shipped', 210],
  ['ORD-005', 'Linus Torvalds', 'processing', 60],
  ['ORD-006', 'Margaret Hamilton', 'shipped', 150],
  ['ORD-007', 'Barbara Liskov', 'processing', 95],
  ['ORD-008', 'Dennis Ritchie', 'shipped', 30],
].map(([id, customer, status, total]) => ({
  customer: String(customer),
  id: String(id),
  status: String(status),
  total: Number(total),
}));

// Options in the column's meta name the faceted filter's values.
const columns: DataTableColumn<Order>[] = [
  { accessorKey: 'id', header: 'Order', meta: { isRowHeader: true } },
  { accessorKey: 'customer', header: 'Customer' },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: {
      options: [
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
  },
  currencyColumn<Order>('total', { currency: 'USD', header: 'Total' }),
];

export function DataTableFilters() {
  const table = useDataTable({
    columns,
    data: orders,
    defaultState: { pagination: { pageIndex: 0, pageSize: 5 } },
  });
  return (
    <DataTable className="not-prose w-full" table={table}>
      <DataTableToolbar>
        <DataTableSearch aria-label="Search orders" placeholder="Search…" />
        <DataTableFacetedFilter column="status" />
      </DataTableToolbar>
      <DataTableFilterChips />
      <DataTableContent aria-label="Orders" />
      <DataTablePagination pageSizes={[5, 10]} />
    </DataTable>
  );
}
