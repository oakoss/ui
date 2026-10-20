import type { ReactNode } from 'react';

import {
  type Cell,
  FlexRender,
  type Row,
  type RowData,
} from '@tanstack/react-table';

import type { DataTableError, DataTableStatus } from '#/lib/data-table-status';

import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '#/components/ui/data/table';
import { Skeleton } from '#/components/ui/feedback/skeleton';
import { Button } from '#/components/ui/inputs/button';
import {
  type DataTableFeatures,
  useDataTableContext,
} from '#/hooks/use-data-table';
import { useClearFilters } from '#/hooks/use-data-table-filters';
import { cn } from '#/lib/cx';

export type { DataTableError } from '#/lib/data-table-status';

export type DataTableBodyLabels = {
  clearFiltersLabel?: string;
  emptyLabel?: ReactNode;
  loadingLabel?: string;
  noResultsLabel?: ReactNode;
};

type DataTableBodyProps = {
  error: DataTableError;
  isRefetching: boolean;
  linkedRowId: string | undefined;
  status: DataTableStatus;
} & DataTableBodyLabels;

// A failed refetch keeps the rows it had, under the error.
export function DataTableBody({
  clearFiltersLabel = 'Clear filters',
  emptyLabel = 'No data.',
  error,
  isRefetching,
  linkedRowId,
  loadingLabel = 'Loading',
  noResultsLabel = 'No results.',
  status,
}: DataTableBodyProps) {
  const table = useDataTableContext();
  const columns = table.getVisibleLeafColumns().length;
  if (status.kind === 'loading') {
    return <LoadingRows columns={columns} label={loadingLabel} />;
  }
  if (status.kind !== 'rows') {
    return (
      <MessageRow columns={columns}>
        {status.kind === 'failed' ? (
          <div role="alert">{error}</div>
        ) : status.kind === 'noResults' ? (
          <NoResults clearLabel={clearFiltersLabel} label={noResultsLabel} />
        ) : (
          emptyLabel
        )}
      </MessageRow>
    );
  }
  const firstRowIndex = status.isError
    ? undefined
    : status.range?.firstRowIndex;
  return (
    <TableBody
      className={cn(isRefetching && 'opacity-60')}
      data-slot="data-table-body"
    >
      {status.isError ? <ErrorRow columns={columns} error={error} /> : null}
      {table.getRowModel().rows.map((row, index) => (
        <DataTableRow
          isLinked={row.id === linkedRowId}
          key={row.id}
          row={row}
          rowIndex={
            firstRowIndex === undefined ? undefined : firstRowIndex + index
          }
        />
      ))}
    </TableBody>
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

function NoResults({
  clearLabel,
  label,
}: {
  clearLabel: string;
  label: ReactNode;
}) {
  const clearFilters = useClearFilters();
  return (
    <div className="flex flex-col items-center gap-2">
      {label}
      <Button
        intent="neutral"
        onPress={(event) => clearFilters(event.target)}
        size="sm"
        variant="outline"
      >
        {clearLabel}
      </Button>
    </div>
  );
}
