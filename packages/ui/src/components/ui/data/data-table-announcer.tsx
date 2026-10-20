import type { RowData } from '@tanstack/react-table';

import { useState } from 'react';

import {
  columnLabel,
  type DataTableInstance,
  defaultPageLabel,
  pageOf,
  selectedCount,
  useDataTableContext,
} from '#/hooks/use-data-table';

export type DataTableMessages = {
  page: (page: number, pageCount: number) => string;
  results: (count: number) => string;
  selected: (count: number) => string;
  sorted: (column: string, direction: 'ascending' | 'descending') => string;
  unsorted: string;
};

type Snapshot = ReturnType<typeof snapshotOf>;

const defaultMessages: DataTableMessages = {
  page: defaultPageLabel,
  results: (count) => `${String(count)} ${count === 1 ? 'result' : 'results'}`,
  selected: (count) =>
    `${String(count)} ${count === 1 ? 'row' : 'rows'} selected`,
  sorted: (column, direction) => `Sorted by ${column}, ${direction}`,
  unsorted: 'Sorting cleared',
};

// Sorting, paging, filtering and selecting change the table without moving
// focus, so a polite live region says what changed. It compares with the
// last render's values, as React suggests for state derived from changes.
export function DataTableAnnouncer({
  messages,
}: {
  messages: Partial<DataTableMessages> | undefined;
}) {
  const table = useDataTableContext();
  const current = snapshotOf(table);
  const [previous, setPrevious] = useState(current);
  const [message, setMessage] = useState('');
  const changed = new Set(
    (['page', 'results', 'selected', 'sorting'] as const).filter(
      (key) => current[key] !== previous[key],
    ),
  );
  if (changed.size > 0) {
    setPrevious(current);
    setMessage(
      describe(table, changed, current, { ...defaultMessages, ...messages }),
    );
  }
  return (
    <span className="sr-only" data-slot="data-table-announcer" role="status">
      {message}
    </span>
  );
}

function describe(
  table: DataTableInstance<RowData>,
  changed: Set<keyof Snapshot>,
  current: Snapshot,
  text: DataTableMessages,
) {
  const parts: string[] = [];
  if (changed.has('sorting')) parts.push(sortMessage(table, text));
  if (changed.has('results')) parts.push(text.results(current.results));
  if (changed.has('page')) {
    const { page, pageCount } = pageOf(table);
    parts.push(text.page(page, pageCount));
  }
  if (changed.has('selected')) parts.push(text.selected(current.selected));
  return parts.join('. ');
}

function snapshotOf(table: DataTableInstance<RowData>) {
  const { pagination, sorting } = table.state;
  return {
    page: `${String(pagination.pageIndex)}/${String(table.getPageCount())}`,
    results: table.getRowCount(),
    selected: selectedCount(table),
    sorting: JSON.stringify(sorting),
  };
}

function sortMessage(
  table: DataTableInstance<RowData>,
  text: DataTableMessages,
) {
  const [first] = table.state.sorting;
  const column = first === undefined ? undefined : table.getColumn(first.id);
  if (first === undefined || column === undefined) return text.unsorted;
  return text.sorted(
    columnLabel(column),
    first.desc ? 'descending' : 'ascending',
  );
}
