import type { RowData } from '@tanstack/react-table';

import {
  type ComponentProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  DataTableAnnouncer,
  type DataTableMessages,
} from '#/components/ui/data/data-table-announcer';
import {
  DataTableBody,
  type DataTableBodyLabels,
} from '#/components/ui/data/data-table-body';
import { DataTableHead } from '#/components/ui/data/data-table-header';
import {
  Table,
  TableHeader,
  type TableProps,
  TableRow,
} from '#/components/ui/data/table';
import {
  DataTableContext,
  type DataTableInstance,
  useDataTableContext,
} from '#/hooks/use-data-table';
import { DataTableClearsContext } from '#/hooks/use-data-table-filters';
import { useLatest } from '#/hooks/use-latest';
import { cn } from '#/lib/cx';
import {
  type DataTableError,
  dataTableStatus,
  hasError,
} from '#/lib/data-table-status';

export type DataTableContentBaseProps = {
  error?: DataTableError;
  isLoading?: boolean;
  isRefetching?: boolean;
  linkedRowId?: string;
  retryFailedLabel?: string;
} & DataTableBodyLabels;

export type DataTableContentProps = DataTableContentBaseProps &
  Omit<TableProps, 'children'>;

export type DataTableProps<TData extends RowData> = {
  messages?: Partial<DataTableMessages>;
  table: DataTableInstance<TData>;
} & ComponentProps<'div'>;

export function DataTable<TData extends RowData>({
  children,
  className,
  messages,
  table,
  ...props
}: DataTableProps<TData>) {
  const [clears, setClears] = useState(0);
  const clearsValue = useMemo(
    () => ({ clears, onClear: () => setClears((count) => count + 1) }),
    [clears],
  );
  return (
    <DataTableContext value={table}>
      <DataTableClearsContext value={clearsValue}>
        <div
          className={cn('flex flex-col gap-4', className)}
          data-slot="data-table"
          {...props}
        >
          {children}
          <DataTableAnnouncer messages={messages} />
        </div>
      </DataTableClearsContext>
    </DataTableContext>
  );
}

export function DataTableContent({
  clearFiltersLabel,
  emptyLabel,
  error,
  isLoading = false,
  isRefetching = false,
  linkedRowId,
  loadingLabel,
  noResultsLabel,
  retryFailedLabel = 'Retry failed',
  ...props
}: DataTableContentProps) {
  const tableRef = useLinkedRow(linkedRowId, isLoading);
  const status = useStatus(error, isLoading);
  const range =
    status.kind === 'rows' && !status.isError ? status.range : undefined;
  return (
    <>
      <Table
        aria-busy={isLoading || isRefetching || undefined}
        aria-rowcount={range?.rowCount}
        ref={tableRef}
        {...props}
      >
        <DataTableHeader isPartial={range !== undefined} />
        <DataTableBody
          clearFiltersLabel={clearFiltersLabel}
          emptyLabel={emptyLabel}
          error={error}
          isRefetching={isRefetching}
          linkedRowId={linkedRowId}
          loadingLabel={loadingLabel}
          noResultsLabel={noResultsLabel}
          status={status}
        />
      </Table>
      <RetryAnnouncer
        isError={hasError(error)}
        isRefetching={isRefetching}
        label={retryFailedLabel}
      />
    </>
  );
}

export function DataTableToolbar({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      data-slot="data-table-toolbar"
      {...props}
    />
  );
}

function DataTableHeader({ isPartial }: { isPartial: boolean }) {
  const table = useDataTableContext();
  return (
    <TableHeader>
      {table.getHeaderGroups().map((group, index) => (
        <TableRow
          aria-rowindex={isPartial ? index + 1 : undefined}
          key={group.id}
        >
          {group.headers.map((header) => (
            <DataTableHead header={header} key={header.id} />
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
}

// The alert stays on screen through a retry, so focus on a retry button
// inside it stays put; an alert that doesn't change isn't announced again,
// so a retry that fails is said here. It clears when a retry starts, so each
// failure is a change.
function RetryAnnouncer({
  isError,
  isRefetching,
  label,
}: {
  isError: boolean;
  isRefetching: boolean;
  label: string;
}) {
  // A refetch is a retry only when it started over an error.
  const [refetch, setRefetch] = useState({ isError, isRefetching });
  const [hasFailed, setHasFailed] = useState(false);
  if (isRefetching !== refetch.isRefetching) {
    setRefetch({ isError, isRefetching });
    setHasFailed(!isRefetching && isError && refetch.isError);
  } else if (hasFailed && !isError) setHasFailed(false);
  return (
    <span aria-live="polite" className="sr-only" data-slot="data-table-retry">
      {hasFailed && isError ? label : ''}
    </span>
  );
}

// A linked row on another page brings its page up; once it's on screen it
// scrolls to the middle and its row header takes focus, once per link, so
// paging away afterwards stays put. Server pages are the app's to fetch.
function useLinkedRow(linkedRowId: string | undefined, isLoading: boolean) {
  const table = useDataTableContext();
  const latestTable = useLatest(table);
  const tableRef = useRef<HTMLTableElement>(null);
  const shownRef = useRef<null | string>(null);
  const { pageIndex, pageSize } = table.state.pagination;
  const index =
    linkedRowId === undefined || table.options.manualPagination === true
      ? -1
      : table
          .getPrePaginatedRowModel()
          .rows.findIndex((row) => row.id === linkedRowId);
  const page = index < 0 ? pageIndex : Math.floor(index / pageSize);
  // Server rows can arrive without the page changing.
  const isShown =
    !isLoading &&
    table.getRowModel().rows.some((row) => row.id === linkedRowId);

  useEffect(() => {
    if (linkedRowId === undefined || shownRef.current === linkedRowId) return;
    if (page !== pageIndex) {
      latestTable.current.setPageIndex(page);
      return;
    }
    const row = tableRef.current?.querySelector<HTMLElement>(
      ':scope > tbody > tr[aria-current="true"]',
    );
    if (!row) return;
    shownRef.current = linkedRowId;
    row.scrollIntoView({ block: 'center' });
    row
      .querySelector<HTMLElement>(':scope > th[scope="row"]')
      ?.focus({ preventScroll: true });
  }, [index, isShown, latestTable, linkedRowId, page, pageIndex]);

  return tableRef;
}

function useStatus(error: DataTableError, isLoading: boolean) {
  const table = useDataTableContext();
  const { columnFilters, globalFilter, pagination } = table.state;
  return dataTableStatus({
    error,
    headerRows: table.getHeaderGroups().length,
    isFiltered: columnFilters.length > 0 || globalFilter !== '',
    isLoading,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    rows: table.getRowModel().rows.length,
    total: table.getRowCount(),
  });
}
