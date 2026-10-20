import type { ReactNode } from 'react';

// A bare `true` renders an empty alert and `count && message` can pass a 0,
// so the type asks for a message.
export type DataTableError = Exclude<ReactNode, bigint | number | true>;

export type DataTableStatus =
  | {
      isError: false;
      kind: 'rows';
      // aria-rowcount and the first row's aria-rowindex, set while only part
      // of the result is on screen.
      range: { firstRowIndex: number; rowCount: number } | undefined;
    }
  | { isError: true; kind: 'rows' }
  | { kind: 'empty' }
  | { kind: 'failed' }
  | { kind: 'loading' }
  | { kind: 'noResults' };

type StatusInput = {
  error: DataTableError;
  headerRows: number;
  isFiltered: boolean;
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  rows: number;
  total: number;
};

export function dataTableStatus({
  error,
  headerRows,
  isFiltered,
  isLoading,
  pageIndex,
  pageSize,
  rows,
  total,
}: StatusInput): DataTableStatus {
  if (isLoading) return { kind: 'loading' };
  const isError = hasError(error);
  if (rows === 0) {
    if (isError) return { kind: 'failed' };
    return { kind: isFiltered ? 'noResults' : 'empty' };
  }
  if (isError) return { isError: true, kind: 'rows' };
  return {
    isError: false,
    kind: 'rows',
    range:
      rows < total
        ? {
            firstRowIndex: headerRows + pageIndex * pageSize + 1,
            rowCount: total + headerRows,
          }
        : undefined,
  };
}

// `isError && message` passes false when nothing failed.
export function hasError(error: DataTableError) {
  return (
    error !== undefined && error !== null && error !== false && error !== ''
  );
}
