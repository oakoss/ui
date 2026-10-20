import type { ReactNode } from 'react';

import {
  type Cell,
  FlexRender,
  type Row,
  type RowData,
} from '@tanstack/react-table';

import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '#/components/ui/data/table';
import { Skeleton } from '#/components/ui/feedback/skeleton';
import {
  type DataTableFeatures,
  useDataTableContext,
} from '#/hooks/use-data-table';
import { cn } from '#/lib/cx';

export type DataTableBodyProps = {
  emptyLabel?: ReactNode;
  // A bare `true` renders an empty alert and `count && message` can pass a
  // 0, so the type asks for a message.
  error?: DataTableError;
  isLoading?: boolean;
  isRefetching?: boolean;
  linkedRowId?: string;
  loadingLabel?: string;
  noResultsLabel?: ReactNode;
  // The rows' place in the whole result, for aria-rowindex; omitted when
  // every row is on screen.
  rowIndexStart?: number;
};

export type DataTableError = Exclude<ReactNode, bigint | number | true>;

export function DataTableBody({
  emptyLabel = 'No data.',
  error,
  isLoading = false,
  isRefetching = false,
  linkedRowId,
  loadingLabel = 'Loading',
  noResultsLabel = 'No results.',
  rowIndexStart,
}: DataTableBodyProps) {
  const table = useDataTableContext();
  const rows = table.getRowModel().rows;
  const columns = table.getVisibleLeafColumns().length;
  if (isLoading) return <LoadingRows columns={columns} label={loadingLabel} />;
  const isError = hasError(error);
  if (isError && rows.length === 0) {
    return (
      <MessageRow columns={columns}>
        <div role="alert">{error}</div>
      </MessageRow>
    );
  }
  if (rows.length === 0) {
    const { columnFilters, globalFilter } = table.state;
    const isFiltered = columnFilters.length > 0 || globalFilter !== '';
    return (
      <MessageRow columns={columns}>
        {isFiltered ? noResultsLabel : emptyLabel}
      </MessageRow>
    );
  }
  return (
    <TableBody
      className={cn(isRefetching && 'opacity-60')}
      data-slot="data-table-body"
    >
      {isError ? <ErrorRow columns={columns} error={error} /> : null}
      {rows.map((row, index) => (
        <DataTableRow
          isLinked={row.id === linkedRowId}
          key={row.id}
          row={row}
          rowIndex={
            rowIndexStart === undefined ? undefined : rowIndexStart + index
          }
        />
      ))}
    </TableBody>
  );
}

// `isError && message` passes false when nothing failed.
export function hasError(error: DataTableError) {
  return (
    error !== undefined && error !== null && error !== false && error !== ''
  );
}

function DataTableCell({
  cell,
  isLinked,
}: {
  cell: Cell<DataTableFeatures, RowData>;
  isLinked: boolean;
}) {
  const meta = cell.column.columnDef.meta;
  const content = <FlexRender cell={cell} />;
  if (meta?.isRowHeader === true) {
    return (
      <TableHead
        align={meta.align}
        className={cn(meta.className)}
        scope="row"
        tabIndex={isLinked ? -1 : undefined}
      >
        {content}
      </TableHead>
    );
  }
  return (
    <TableCell align={meta?.align} className={cn(meta?.className)}>
      {content}
    </TableCell>
  );
}

function DataTableRow({
  isLinked,
  row,
  rowIndex,
}: {
  isLinked: boolean;
  row: Row<DataTableFeatures, RowData>;
  rowIndex: number | undefined;
}) {
  const { rowSelection } = useDataTableContext().state;
  // Relative so a stretched row link covers the row.
  return (
    <TableRow
      aria-current={isLinked ? 'true' : undefined}
      aria-rowindex={rowIndex}
      aria-selected={
        row.getCanSelect() ? rowSelection[row.id] === true : undefined
      }
      className="relative"
      data-slot="data-table-row"
    >
      {row.getVisibleCells().map((cell) => (
        <DataTableCell cell={cell} isLinked={isLinked} key={cell.id} />
      ))}
    </TableRow>
  );
}

// A failed refetch keeps the rows it had, under the error.
function ErrorRow({ columns, error }: { columns: number; error: ReactNode }) {
  return (
    <TableRow data-slot="data-table-error">
      <TableCell
        className="bg-destructive-subtle text-destructive-text"
        colSpan={Math.max(columns, 1)}
      >
        <div role="alert">{error}</div>
      </TableCell>
    </TableRow>
  );
}

// The skeleton rows are hidden from assistive tech, so a visually hidden row
// says what they stand for.
function LoadingRows({ columns, label }: { columns: number; label: string }) {
  const { pageSize } = useDataTableContext().state.pagination;
  const keys = Array.from({ length: Math.min(pageSize, 10) }, (_, row) =>
    String(row),
  );
  return (
    <TableBody data-slot="data-table-body">
      <TableRow className="sr-only">
        <TableCell colSpan={Math.max(columns, 1)}>{label}</TableCell>
      </TableRow>
      {keys.map((key) => (
        <TableRow aria-hidden key={key}>
          {Array.from({ length: columns }, (_, column) => (
            <TableCell key={`${key}-${String(column)}`}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

function MessageRow({
  children,
  columns,
}: {
  children: ReactNode;
  columns: number;
}) {
  return (
    <TableBody data-slot="data-table-body">
      <TableRow>
        <TableCell
          className="h-24 text-center text-muted-foreground"
          colSpan={Math.max(columns, 1)}
        >
          {children}
        </TableCell>
      </TableRow>
    </TableBody>
  );
}
