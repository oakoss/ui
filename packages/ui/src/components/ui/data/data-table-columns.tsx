import type { Row, RowData } from '@tanstack/react-table';

import { type ReactNode, useMemo, useRef } from 'react';
import { Link, type LinkProps, useLocale } from 'react-aria-components';

import { Checkbox } from '#/components/ui/inputs/checkbox';
import {
  type DataTableColumn,
  type DataTableFeatures,
  useDataTableContext,
} from '#/hooks/use-data-table';
import { cn } from '#/lib/cx';

type ColumnOptions = { header: string; id?: string };

type DataRow<TData extends RowData> = Row<DataTableFeatures, TData>;

// Above a stretched row link, so they keep their own clicks.
const raised = 'relative z-1';

export function actionsColumn<TData extends RowData>({
  cell,
  label = 'Actions',
}: {
  cell: (row: DataRow<TData>) => ReactNode;
  label?: string;
}): DataTableColumn<TData> {
  return {
    cell: ({ row }) => <div className={cn(raised)}>{cell(row)}</div>,
    enableHiding: false,
    enableSorting: false,
    header: () => <span className="sr-only">{label}</span>,
    id: 'actions',
    meta: { align: 'end', label },
  };
}

export function currencyColumn<TData extends RowData>(
  accessorKey: keyof TData & string,
  { currency, ...options }: { currency: string } & ColumnOptions,
): DataTableColumn<TData> {
  return numberColumn(accessorKey, {
    ...options,
    format: { currency, style: 'currency' },
  });
}

export function dateColumn<TData extends RowData>(
  accessorKey: keyof TData & string,
  {
    format = { dateStyle: 'medium' },
    ...options
  }: { format?: Intl.DateTimeFormatOptions } & ColumnOptions,
): DataTableColumn<TData> {
  return {
    ...options,
    accessorKey,
    cell: ({ getValue }) => (
      <FormattedDate format={format} value={getValue()} />
    ),
    sortFn: sortBy<TData>(toDate),
  };
}

// A link in the row's heading cell that stretches over the whole row, so the
// row opens on a click anywhere while keeping one link per row for keyboard
// and screen reader users.
export function linkColumn<TData extends RowData>(
  accessorKey: keyof TData & string,
  {
    href,
    ...options
  }: { href: (row: DataRow<TData>) => LinkProps['href'] } & ColumnOptions,
): DataTableColumn<TData> {
  return {
    ...options,
    accessorKey,
    cell: ({ getValue, row }) => (
      <Link
        className="font-medium underline-offset-4 outline-none after:absolute after:inset-0 hover:underline focus-visible:after:outline-(length:--ring-width) focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring focus-visible:after:outline-solid"
        href={href(row)}
      >
        {asText(getValue())}
      </Link>
    ),
    meta: { isRowHeader: true },
  };
}

export function numberColumn<TData extends RowData>(
  accessorKey: keyof TData & string,
  { format, ...options }: { format?: Intl.NumberFormatOptions } & ColumnOptions,
): DataTableColumn<TData> {
  return {
    ...options,
    accessorKey,
    cell: ({ getValue }) => (
      <FormattedNumber format={format} value={getValue()} />
    ),
    meta: { align: 'end' },
    sortFn: sortBy<TData>(toNumber),
  };
}

// Selects the rows on the current page; Shift selects the range from the
// last row pressed. Selection reads the table's state rather than the row,
// so a memoized cell can't show a stale box.
export function selectionColumn<TData extends RowData>({
  label = 'Select all on this page',
  rowLabel = () => 'Select row',
}: {
  label?: string;
  rowLabel?: (row: DataRow<TData>) => string;
} = {}): DataTableColumn<TData> {
  return {
    cell: ({ row }) => <RowCheckbox label={rowLabel(row)} row={row} />,
    enableHiding: false,
    enableSorting: false,
    header: () => <PageCheckbox label={label} />,
    id: 'select',
    meta: { className: 'w-0', label },
  };
}

function asText(value: unknown) {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : '';
}

function FormattedDate({
  format,
  value,
}: {
  format: Intl.DateTimeFormatOptions;
  value: unknown;
}) {
  const { locale } = useLocale();
  // A bare day parses as UTC midnight, so it formats in UTC to keep its day.
  const isDay = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/u.test(value);
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(
        locale,
        isDay ? { ...format, timeZone: 'UTC' } : format,
      ),
    [format, isDay, locale],
  );
  const date = toDate(value);
  if (date === undefined) return null;
  return (
    <time dateTime={isDay ? value : date.toISOString()}>
      {formatter.format(date)}
    </time>
  );
}

function FormattedNumber({
  format,
  value,
}: {
  format: Intl.NumberFormatOptions | undefined;
  value: unknown;
}) {
  const { locale } = useLocale();
  const formatter = useMemo(
    () => new Intl.NumberFormat(locale, format),
    [format, locale],
  );
  const number = toNumber(value);
  return number === undefined ? null : formatter.format(number);
}

function PageCheckbox({ label }: { label: string }) {
  const table = useDataTableContext();
  const { rowSelection } = table.state;
  const rows = table.getRowModel().rows.filter((row) => row.getCanSelect());
  const selected = rows.filter((row) => rowSelection[row.id] === true).length;
  return (
    <Checkbox
      aria-label={label}
      className={cn(raised)}
      isDisabled={rows.length === 0}
      isIndeterminate={selected > 0 && selected < rows.length}
      isSelected={rows.length > 0 && selected === rows.length}
      onChange={(isSelected) => table.toggleAllPageRowsSelected(isSelected)}
      targetSize={false}
    />
  );
}

function RowCheckbox<TData extends RowData>({
  label,
  row,
}: {
  label: string;
  row: DataRow<TData>;
}) {
  const table = useDataTableContext();
  const shiftRef = useRef(false);
  return (
    <Checkbox
      aria-label={label}
      className={cn(raised)}
      isDisabled={!row.getCanSelect()}
      isSelected={table.state.rowSelection[row.id] === true}
      onChange={(checked) =>
        row.getToggleSelectedHandler()({
          shiftKey: shiftRef.current,
          target: { checked },
        })
      }
      onKeyDown={(event) => {
        shiftRef.current = event.shiftKey;
      }}
      // React Aria's press handling stops pointerdown from bubbling.
      onPointerDownCapture={(event) => {
        shiftRef.current = event.shiftKey;
      }}
      targetSize={false}
    />
  );
}

// Sorts by the value a preset shows rather than the raw one, so numbers
// that arrive as strings and dates with different offsets order correctly.
// Values it can't read sort lowest.
function sortBy<TData extends RowData>(read: (value: unknown) => unknown) {
  return (a: DataRow<TData>, b: DataRow<TData>, id: string) => {
    const x = Number(read(a.getValue(id)) ?? -Infinity);
    const y = Number(read(b.getValue(id)) ?? -Infinity);
    return x === y ? 0 : x < y ? -1 : 1;
  };
}

function toDate(value: unknown) {
  const date =
    typeof value === 'number' ||
    typeof value === 'string' ||
    value instanceof Date
      ? new Date(value)
      : undefined;
  return date === undefined || Number.isNaN(date.getTime()) ? undefined : date;
}

// Decimal columns often arrive as strings, such as "12.50".
function toNumber(value: unknown) {
  const number =
    typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return typeof number === 'number' && Number.isFinite(number)
    ? number
    : undefined;
}
