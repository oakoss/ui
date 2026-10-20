import {
  DataTable,
  DataTableContent,
  type DataTableContentProps,
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
  type DataTableState,
  useDataTable,
} from '@oakoss/ui/hooks/use-data-table';
import { selectedRows } from '@oakoss/ui/hooks/use-data-table-selection';
import {
  type DataTableQuery,
  dataTableQuery,
} from '@oakoss/ui/lib/data-table-query';
import { useEffect, useState } from 'react';
import { within } from 'storybook/test';

export type Payment = {
  amount: number;
  createdAt: string;
  email: string;
  id: string;
  status: 'failed' | 'paid' | 'pending';
};

// The body's rows, after the header's row group.
export function bodyRows(canvas: ReturnType<typeof within>) {
  const [, body] = canvas.getAllByRole('rowgroup');
  return within(body ?? document.body).getAllByRole('row');
}

// The pagination bar's "Page n of m", apart from the live region's copy.
export function pageLabel(canvas: ReturnType<typeof within>) {
  return canvas.getByText(/^Page \d+ of \d+$/u, { selector: 'p' });
}

export function rowHeaders(canvas: ReturnType<typeof within>) {
  return canvas
    .getAllByRole('rowheader')
    .map((cell: HTMLElement) => cell.textContent);
}

const statuses = ['paid', 'pending', 'failed'] as const;

// 25 payments with fixed values, so every run renders the same rows.
export const payments: Payment[] = Array.from({ length: 25 }, (_, index) => ({
  amount: ((index * 7919) % 900) + 100,
  createdAt: `2026-0${String((index % 9) + 1)}-1${String(index % 9)}T12:00:00Z`,
  email: `customer${String(index + 1).padStart(2, '0')}@example.com`,
  id: `PAY-${String(index + 1).padStart(3, '0')}`,
  status: statuses[index % 3] ?? 'paid',
}));

export const paymentColumns: DataTableColumn<Payment>[] = [
  selectionColumn<Payment>({ rowLabel: (row) => `Select ${row.original.id}` }),
  {
    accessorKey: 'id',
    enableHiding: false,
    header: 'Payment',
    meta: { isRowHeader: true },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: {
      options: [
        { label: 'Paid', value: 'paid' },
        { label: 'Pending', value: 'pending' },
        { label: 'Failed', value: 'failed' },
      ],
    },
  },
  { accessorKey: 'email', header: 'Email' },
  dateColumn<Payment>('createdAt', { header: 'Created' }),
  currencyColumn<Payment>('amount', { currency: 'USD', header: 'Amount' }),
  actionsColumn<Payment>({
    cell: (row) => (
      <Button intent="neutral" size="sm" variant="ghost">
        Refund {row.original.id}
      </Button>
    ),
  }),
];

export type PaymentsTableProps = {
  // Which payments can be selected; all of them by default.
  canSelect?: (payment: Payment) => boolean;
  columns?: DataTableColumn<Payment>[];
  data?: Payment[];
  defaultState?: Partial<DataTableState>;
  // Lists the selected payments in the action bar, as a client action reads them.
  showSelected?: boolean;
} & Omit<DataTableContentProps, 'aria-label'>;

export function PaymentsTable({
  canSelect,
  columns = paymentColumns,
  data = payments,
  defaultState,
  showSelected = false,
  ...props
}: PaymentsTableProps) {
  const table = useDataTable({
    columns,
    data,
    defaultState,
    enableRowSelection: canSelect ? (row) => canSelect(row.original) : true,
    getRowId: (row) => row.id,
  });
  return (
    <DataTable className="w-4xl max-w-full" table={table}>
      <DataTableToolbar>
        <DataTableViewOptions />
      </DataTableToolbar>
      <DataTableContent aria-label="Payments" {...props} />
      <DataTableActionBar>
        {showSelected ? (
          <span data-testid="selected-rows">
            {selectedRows(table)
              .map((payment) => payment.id)
              .join(' ')}
          </span>
        ) : null}
      </DataTableActionBar>
      <DataTablePagination />
    </DataTable>
  );
}

// A server stand-in: it sorts and slices the payments for the page the table
// asks for, and reports the total, as an API would.
// `total` stands in for a total that shrank, with no rows on the page asked.
export function ServerPaymentsTable({
  initialPage = 0,
  isLoadedLater = false,
  linkedRowId,
  total,
}: {
  initialPage?: number;
  isLoadedLater?: boolean;
  linkedRowId?: string;
  total?: number;
}) {
  const [isLoaded, setIsLoaded] = useState(!isLoadedLater);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);
  const [state, setState] = useState<
    Pick<DataTableState, 'pagination' | 'sorting'>
  >({ pagination: { pageIndex: initialPage, pageSize: 10 }, sorting: [] });
  const query: DataTableQuery = dataTableQuery({
    ...state,
    columnFilters: [],
    globalFilter: '',
  });
  const rows = isLoaded && total === undefined ? serverPage(state) : [];
  const table = useDataTable({
    columns: paymentColumns.slice(1),
    data: rows,
    getRowId: (row) => row.id,
    mode: 'server',
    onPaginationChange: (pagination) =>
      setState((previous) => ({ ...previous, pagination })),
    onSortingChange: (sorting) =>
      setState((previous) => ({ ...previous, sorting })),
    rowCount: total ?? payments.length,
    state,
  });
  return (
    <DataTable className="w-4xl max-w-full" table={table}>
      <code data-testid="query">{JSON.stringify(query)}</code>
      <DataTableContent
        aria-label="Payments"
        isLoading={!isLoaded}
        linkedRowId={linkedRowId}
      />
      <DataTablePagination />
    </DataTable>
  );
}

function serverPage({
  pagination,
  sorting,
}: Pick<DataTableState, 'pagination' | 'sorting'>) {
  const [sort] = sorting;
  const sorted = sort
    ? payments.toSorted((a, b) => {
        const value = (payment: Payment) =>
          String(new Map(Object.entries(payment)).get(sort.id));
        const order = value(a).localeCompare(value(b), 'en', { numeric: true });
        return sort.desc ? -order : order;
      })
    : payments;
  const start = pagination.pageIndex * pagination.pageSize;
  return sorted.slice(start, start + pagination.pageSize);
}
