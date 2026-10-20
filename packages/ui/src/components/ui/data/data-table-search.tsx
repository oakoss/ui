import { useCallback, useEffect, useState } from 'react';

import {
  SearchField,
  type SearchFieldProps,
} from '#/components/ui/inputs/search-field';
import { useDataTableContext } from '#/hooks/use-data-table';
import { useDataTableClears } from '#/hooks/use-data-table-filters';
import { useLatest } from '#/hooks/use-latest';
import { cx } from '#/lib/cx';

export type DataTableSearchProps = {
  // Filters one column instead of the whole table.
  column?: string;
  // How long typing pauses before the table filters; 150ms, or 300ms when
  // the server filters.
  debounceMs?: number;
} & WithoutValue<SearchFieldProps>;

// Omits from each member of SearchField's props union.
type WithoutValue<T> = T extends unknown
  ? Omit<T, 'defaultValue' | 'onChange' | 'value'>
  : never;

// The field shows what's typed at once, and the table filters once typing
// pauses, so each keystroke doesn't refilter, refetch or announce results. A
// change from outside, such as the app's URL, or clearing the filters
// replaces what's typed; the field's own writes arriving late don't.
export function DataTableSearch({
  className,
  column: columnId,
  debounceMs,
  ...props
}: DataTableSearchProps) {
  const table = useDataTableContext();
  const latestTable = useLatest(table);
  const applied = filterText(
    columnId === undefined
      ? table.state.globalFilter
      : table.getColumn(columnId)?.getFilterValue(),
  );
  const { noteWrite, setText, text } = useTypedText(applied);
  const delay =
    debounceMs ?? (table.options.manualFiltering === true ? 300 : 150);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text === applied) return;
      noteWrite(text);
      const current = latestTable.current;
      if (columnId === undefined) current.setGlobalFilter(text);
      else current.getColumn(columnId)?.setFilterValue(text || undefined);
    }, delay);
    return () => clearTimeout(timer);
  }, [applied, columnId, delay, latestTable, noteWrite, text]);

  return (
    <SearchField
      className={cx('w-full min-w-0 sm:w-64', className)}
      onChange={setText}
      value={text}
      {...props}
    />
  );
}

function filterText(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function useTypedText(applied: string) {
  const { clears } = useDataTableClears();
  const [text, setText] = useState(applied);
  const [seen, setSeen] = useState({ applied, clears });
  // Writes the app hasn't applied yet, oldest first. A value that isn't one
  // of them means the app went its own way, so the rest won't land.
  const [written, setWritten] = useState<readonly string[]>([]);
  const noteWrite = useCallback((value: string) => {
    setWritten((pending) => [...pending, value]);
  }, []);
  if (clears !== seen.clears) {
    setSeen({ applied, clears });
    setText(applied);
  } else if (applied !== seen.applied) {
    setSeen({ applied, clears });
    const landed = written.lastIndexOf(applied);
    if (landed === -1) {
      setWritten([]);
      setText(applied);
    } else setWritten(written.slice(landed + 1));
  }
  return { noteWrite, setText, text };
}
