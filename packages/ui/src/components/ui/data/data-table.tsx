import type { RowData } from '@tanstack/react-table';

import { type ComponentProps, useEffect, useRef } from 'react';

import {
  DataTableAnnouncer,
  type DataTableMessages,
} from '#/components/ui/data/data-table-announcer';
import {
  DataTableBody,
  type DataTableBodyProps,
  hasError,
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
import { useLatest } from '#/hooks/use-latest';
import { cn } from '#/lib/cx';

export type DataTableContentProps = DataTableBodyProps &
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
  return (
    <DataTableContext value={table}>
      <div
        className={cn('flex flex-col gap-4', className)}
        data-slot="data-table"
        {...props}
      >
        {children}
        <DataTableAnnouncer messages={messages} />
      </div>
    </DataTableContext>
  );
}

export function DataTableContent({
  emptyLabel,
  error,
  isLoading = false,
  isRefetching = false,
  linkedRowId,
  loadingLabel,
  noResultsLabel,
  ...props
}: DataTableContentProps) {
  const table = useDataTableContext();
  const tableRef = useLinkedRow(linkedRowId, isLoading);
  const headerRows = table.getHeaderGroups().length;
  const { pageIndex, pageSize } = table.state.pagination;
  const total = table.getRowCount();
  // Row counts say where a page sits in the whole result.
  const rows = table.getRowModel().rows.length;
  const isPartial = !isLoading && !hasError(error) && rows > 0 && rows < total;
  return (
    <Table
      aria-busy={isLoading || isRefetching || undefined}
      aria-rowcount={isPartial ? total + headerRows : undefined}
      ref={tableRef}
      {...props}
    >
      <DataTableHeader isPartial={isPartial} />
      <DataTableBody
        emptyLabel={emptyLabel}
        error={error}
        isLoading={isLoading}
        isRefetching={isRefetching}
        linkedRowId={linkedRowId}
        loadingLabel={loadingLabel}
        noResultsLabel={noResultsLabel}
        rowIndexStart={
          isPartial ? headerRows + pageIndex * pageSize + 1 : undefined
        }
      />
    </Table>
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
