import {
  DataTable,
  DataTableContent,
  DataTableToolbar,
} from '@oakoss/ui/components/ui/data/data-table';
import { DataTableActionBar } from '@oakoss/ui/components/ui/data/data-table-action-bar';
import { selectionColumn } from '@oakoss/ui/components/ui/data/data-table-columns';
import { DataTablePagination } from '@oakoss/ui/components/ui/data/data-table-pagination';
import { DataTableSearch } from '@oakoss/ui/components/ui/data/data-table-search';
import { Alert, AlertTitle } from '@oakoss/ui/components/ui/feedback/alert';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@oakoss/ui/components/ui/overlays/alert-dialog';
import {
  type DataTableColumn,
  type DataTableSelection,
  type DataTableState,
  useDataTable,
} from '@oakoss/ui/hooks/use-data-table';
import { useState } from 'react';

type Invoice = { id: string; status: 'draft' | 'sent' };

type Result = { deleted: number; refused: number; requested: number };

type TableState = Pick<
  DataTableState,
  'globalFilter' | 'pagination' | 'selection'
>;

const columns: DataTableColumn<Invoice>[] = [
  selectionColumn<Invoice>({ rowLabel: (row) => `Select ${row.original.id}` }),
  { accessorKey: 'id', header: 'Invoice', meta: { isRowHeader: true } },
  { accessorKey: 'status', header: 'Status' },
];

const invoices: Invoice[] = Array.from({ length: 12 }, (_, index) => ({
  id: `INV-${String(index + 1).padStart(3, '0')}`,
  status: index % 4 === 0 ? 'sent' : 'draft',
}));

export function DataTableBulkActions() {
  const [rows, setRows] = useState(invoices);
  const [result, setResult] = useState<Result>();
  const [state, set] = useTableState();
  const matching = search(rows, state.globalFilter);
  const { pageIndex, pageSize } = state.pagination;
  const table = useDataTable({
    columns,
    data: matching.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    enableRowSelection: true,
    getRowId: (row) => row.id,
    mode: 'server',
    onGlobalFilterChange: (globalFilter) => set({ globalFilter }),
    onPaginationChange: (pagination) => set({ pagination }),
    onSelectionChange: (selection) => set({ selection }),
    rowCount: matching.length,
    state,
  });

  function remove(selection: DataTableSelection, requested: number) {
    const { deleted, refused } = deleteInvoices(rows, selection);
    setRows((all) => all.filter((row) => !deleted.includes(row.id)));
    setResult({ deleted: deleted.length, refused: refused.length, requested });
    // Refused rows stay selected, and the page steps back if it emptied.
    const left = matching.filter((row) => !deleted.includes(row.id)).length;
    const last = Math.ceil(left / pageSize) - 1;
    const page = Math.max(Math.min(pageIndex, last), 0);
    set({
      pagination: { pageIndex: page, pageSize },
      selection: { ids: refused },
    });
  }

  return (
    <DataTable className="not-prose w-full" table={table}>
      <DataTableToolbar>
        <DataTableSearch aria-label="Search invoices" />
      </DataTableToolbar>
      {result ? <ResultAlert result={result} /> : null}
      <DataTableContent aria-label="Invoices" />
      <DeleteBar onDelete={remove} />
      <DataTablePagination pageSizes={[5, 10]} />
    </DataTable>
  );
}

function DeleteBar({
  onDelete,
}: {
  onDelete: (selection: DataTableSelection, count: number) => void;
}) {
  return (
    <DataTableActionBar>
      {({ selected, selection }) => (
        <AlertDialogTrigger>
          <Button intent="destructive" size="sm">
            Delete
          </Button>
          <AlertDialog>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {selected} {selected === 1 ? 'invoice' : 'invoices'}?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                intent="destructive"
                onAction={() => onDelete(selection, selected)}
              >
                Delete {selected}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialog>
        </AlertDialogTrigger>
      )}
    </DataTableActionBar>
  );
}

// Stands in for an API: it applies the selection's saved search itself, so
// "all" means every invoice matching it apart from the exceptions, and it
// refuses sent invoices.
function deleteInvoices(rows: Invoice[], selection: DataTableSelection) {
  const targets =
    selection.all === undefined
      ? rows.filter((row) => selection.ids.includes(row.id))
      : search(rows, selection.all.search ?? '').filter(
          (row) => !selection.except.includes(row.id),
        );
  return {
    deleted: targets
      .filter((row) => row.status === 'draft')
      .map((row) => row.id),
    refused: targets
      .filter((row) => row.status === 'sent')
      .map((row) => row.id),
  };
}

function invoiceCount(count: number) {
  return `${String(count)} ${count === 1 ? 'invoice was' : 'invoices were'}`;
}

// Any shortfall from the count confirmed is a failure, rows already gone
// included.
function ResultAlert({ result }: { result: Result }) {
  const { deleted, refused, requested } = result;
  const gone = requested - deleted - refused;
  return (
    <Alert
      intent={deleted < requested ? 'destructive' : 'success'}
      role={deleted < requested ? 'alert' : 'status'}
    >
      <AlertTitle>
        {`Deleted ${String(deleted)} of ${String(requested)}.`}
        {refused > 0 ? ` ${invoiceCount(refused)} sent, so not deleted.` : ''}
        {gone > 0 ? ` ${invoiceCount(gone)} already gone.` : ''}
      </AlertTitle>
    </Alert>
  );
}

function search(rows: Invoice[], text: string) {
  const query = text.trim().toLowerCase();
  return rows.filter((row) => row.id.toLowerCase().includes(query));
}

function useTableState() {
  const [state, setState] = useState<TableState>({
    globalFilter: '',
    pagination: { pageIndex: 0, pageSize: 5 },
    selection: { ids: [] },
  });
  const set = (next: Partial<TableState>) =>
    setState((previous) => ({ ...previous, ...next }));
  return [state, set] as const;
}
