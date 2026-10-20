import {
  DataTable,
  DataTableContent,
  DataTableToolbar,
} from '@oakoss/ui/components/ui/data/data-table';
import { DataTableActionBar } from '@oakoss/ui/components/ui/data/data-table-action-bar';
import {
  actionsColumn,
  currencyColumn,
  dateColumn,
  selectionColumn,
} from '@oakoss/ui/components/ui/data/data-table-columns';
import { DataTablePagination } from '@oakoss/ui/components/ui/data/data-table-pagination';
import { DataTableViewOptions } from '@oakoss/ui/components/ui/data/data-table-view-options';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  type DataTableColumn,
  useDataTable,
} from '@oakoss/ui/hooks/use-data-table';

type Payment = {
  amount: number;
  createdAt: string;
  email: string;
  id: string;
  status: string;
};

const payments: Payment[] = [
  ['PAY-001', 'paid', 'ada@example.com', 250, '2026-01-04'],
  ['PAY-002', 'pending', 'grace@example.com', 150, '2026-01-09'],
  ['PAY-003', 'failed', 'alan@example.com', 350, '2026-02-02'],
  ['PAY-004', 'paid', 'katherine@example.com', 450, '2026-02-17'],
  ['PAY-005', 'paid', 'linus@example.com', 550, '2026-03-01'],
  ['PAY-006', 'pending', 'margaret@example.com', 200, '2026-03-12'],
  ['PAY-007', 'paid', 'barbara@example.com', 300, '2026-04-05'],
  ['PAY-008', 'failed', 'dennis@example.com', 120, '2026-04-21'],
].map(([id, status, email, amount, createdAt]) => ({
  amount: Number(amount),
  createdAt: String(createdAt),
  email: String(email),
  id: String(id),
  status: String(status),
}));

const columns: DataTableColumn<Payment>[] = [
  selectionColumn<Payment>({ rowLabel: (row) => `Select ${row.original.id}` }),
  {
    accessorKey: 'id',
    enableHiding: false,
    header: 'Payment',
    meta: { isRowHeader: true },
  },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'email', header: 'Email' },
  dateColumn<Payment>('createdAt', { header: 'Created' }),
  currencyColumn<Payment>('amount', { currency: 'USD', header: 'Amount' }),
  actionsColumn<Payment>({
    cell: (row) => (
      <Button intent="neutral" size="sm" variant="ghost">
        Refund<span className="sr-only"> {row.original.id}</span>
      </Button>
    ),
  }),
];

export function DataTableDemo() {
  const table = useDataTable({
    columns,
    data: payments,
    defaultState: { pagination: { pageIndex: 0, pageSize: 5 } },
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });
  return (
    <DataTable className="not-prose w-full" table={table}>
      <DataTableToolbar>
        <DataTableViewOptions />
      </DataTableToolbar>
      <DataTableContent aria-label="Payments" />
      <DataTableActionBar />
      <DataTablePagination pageSizes={[5, 10]} />
    </DataTable>
  );
}
