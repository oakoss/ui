import {
  DataTable,
  DataTableContent,
  DataTableToolbar,
} from '@oakoss/ui/components/ui/data/data-table';
import { DataTableActionBar } from '@oakoss/ui/components/ui/data/data-table-action-bar';
import { DataTableFacetedFilter } from '@oakoss/ui/components/ui/data/data-table-faceted-filter';
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
  type DataTableSelection,
  type DataTableState,
  useDataTable,
} from '@oakoss/ui/hooks/use-data-table';
import {
  type DataTableMatch,
  dataTableMatch,
} from '@oakoss/ui/lib/data-table-query';
import { isAllMatching } from '@oakoss/ui/lib/data-table-selection';
import { useState } from 'react';

import { type Payment, paymentColumns, payments } from './data-table-demo';

type Result = {
  deleted: number;
  failed: { id: string; reason: string }[];
  requested: number;
};

type ServerState = Pick<
  DataTableState,
  'columnFilters' | 'globalFilter' | 'pagination' | 'selection'
>;

// A server stand-in: it filters and pages the payments itself, and deletes
// what a selection names, applying a saved filter when the action runs. Paid
// payments refuse, so a delete can partly fail.
export function BulkPaymentsTable({
  onSelectionChange,
}: {
  onSelectionChange?: (selection: DataTableSelection) => void;
}) {
  const [rows, setRows] = useState(payments);
  const { select, set, state } = useServerState(onSelectionChange);
  const [result, setResult] = useState<Result>();
  const matching = rows.filter((row) => matches(row, dataTableMatch(state)));
  const start = state.pagination.pageIndex * state.pagination.pageSize;
  const table = useDataTable({
    columns: paymentColumns,
    data: matching.slice(start, start + state.pagination.pageSize),
    enableRowSelection: true,
    getRowId: (row) => row.id,
    mode: 'server',
    onColumnFiltersChange: set('columnFilters'),
    onGlobalFilterChange: set('globalFilter'),
    onPaginationChange: set('pagination'),
    onSelectionChange: select,
    rowCount: matching.length,
    state,
  });

  function remove(selection: DataTableSelection, requested: number) {
    const { deleted, failed } = serverDelete(rows, selection);
    setRows((all) => all.filter((row) => !deleted.has(row.id)));
    setResult({ deleted: deleted.size, failed, requested });
    // Rows that failed stay selected, ready to retry or change.
    select({ ids: failed.map((failure) => failure.id) });
    const left = matching.filter((row) => !deleted.has(row.id)).length;
    set('pagination')(lastPageWithRows(state.pagination, left));
  }

  return (
    <DataTable className="w-4xl max-w-full" table={table}>
      <BulkToolbar />
      {result ? <ResultAlert result={result} /> : null}
      <DataTableContent aria-label="Payments" />
      <DeleteBar onDelete={remove} />
      <DataTablePagination />
    </DataTable>
  );
}

function BulkToolbar() {
  return (
    <DataTableToolbar>
      <DataTableSearch aria-label="Search payments" />
      <DataTableFacetedFilter column="status" />
    </DataTableToolbar>
  );
}

// The count in the title and the button says what the delete will touch;
// the dialog focuses Cancel.
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
                Delete {selected} {selected === 1 ? 'payment' : 'payments'}?
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

function isSelected(row: Payment, selection: DataTableSelection) {
  return isAllMatching(selection)
    ? matches(row, selection.all) && !selection.except.includes(row.id)
    : selection.ids.includes(row.id);
}

// A server answers with the last page that still has rows.
function lastPageWithRows(
  { pageIndex, pageSize }: ServerState['pagination'],
  rows: number,
) {
  const last = Math.max(Math.ceil(rows / pageSize) - 1, 0);
  return { pageIndex: Math.min(pageIndex, last), pageSize };
}

function matches(row: Payment, { filters, search }: DataTableMatch) {
  const statuses = filters?.status;
  return (
    (!Array.isArray(statuses) || statuses.includes(row.status)) &&
    (search === undefined || row.email.includes(search))
  );
}

// Any shortfall from the count the user confirmed is a failure, including
// rows already gone by the time the delete ran.
function ResultAlert({ result }: { result: Result }) {
  const isPartial = result.deleted < result.requested;
  const [failure] = result.failed;
  const gone = result.requested - result.deleted - result.failed.length;
  return (
    <Alert
      intent={isPartial ? 'destructive' : 'success'}
      role={isPartial ? 'alert' : 'status'}
    >
      <AlertTitle>
        {`Deleted ${String(result.deleted)} of ${String(result.requested)}.`}
        {failure
          ? ` ${String(result.failed.length)} couldn’t be deleted: ${failure.reason}.`
          : ''}
        {gone > 0 ? ` ${String(gone)} already gone.` : ''}
      </AlertTitle>
    </Alert>
  );
}

function serverDelete(rows: Payment[], selection: DataTableSelection) {
  const targets = rows.filter((row) => isSelected(row, selection));
  const failed = targets
    .filter((row) => row.status === 'paid')
    .map((row) => ({ id: row.id, reason: 'Paid payments can’t be deleted' }));
  const refused = new Set(failed.map((failure) => failure.id));
  const deleted = new Set(
    targets.filter((row) => !refused.has(row.id)).map((row) => row.id),
  );
  return { deleted, failed };
}

function useServerState(
  onSelectionChange: ((selection: DataTableSelection) => void) | undefined,
) {
  const [state, setState] = useState<ServerState>({
    columnFilters: [],
    globalFilter: '',
    pagination: { pageIndex: 0, pageSize: 10 },
    selection: { ids: [] },
  });
  const set =
    <K extends keyof ServerState>(key: K) =>
    (value: ServerState[K]) =>
      setState((previous) => ({ ...previous, [key]: value }));
  const select = (selection: DataTableSelection) => {
    onSelectionChange?.(selection);
    set('selection')(selection);
  };
  return { select, set, state };
}
