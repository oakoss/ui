import type { ColumnFilter, RowData } from '@tanstack/react-table';

import { type ComponentProps, useRef } from 'react';

import { Tag, TagGroup } from '#/components/ui/data/tag-group';
import { Button } from '#/components/ui/inputs/button';
import {
  columnLabel,
  type DataTableInstance,
  optionValues,
  useDataTableContext,
  valueText,
} from '#/hooks/use-data-table';
import { focusSearch, useClearFilters } from '#/hooks/use-data-table-filters';
import { cn } from '#/lib/cx';

export type DataTableFilterChipsProps = {
  label?: string;
  resetLabel?: string;
} & ComponentProps<'div'>;

type Chip = { id: string; text: string };

// One chip per filtered column, hidden columns included, so a filter that
// hides rows can always be seen and cleared. Reset clears every filter and
// the search, then moves focus to the search field.
export function DataTableFilterChips({
  className,
  label = 'Active filters',
  resetLabel = 'Reset',
  ...props
}: DataTableFilterChipsProps) {
  const table = useDataTableContext();
  const clearFilters = useClearFilters();
  const ref = useRef<HTMLDivElement>(null);
  const { columnFilters, globalFilter } = table.state;
  if (globalFilter === '' && columnFilters.length === 0) return null;
  const chips = columnFilters.map((filter) => chipOf(table, filter));
  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      data-slot="data-table-filter-chips"
      ref={ref}
      {...props}
    >
      {chips.length > 0 ? (
        <TagGroup
          aria-label={label}
          items={chips}
          onRemove={(keys) => {
            removeChips(table, [...keys].map(String), chips, ref.current);
          }}
        >
          {(chip) => <Tag id={chip.id}>{chip.text}</Tag>}
        </TagGroup>
      ) : null}
      <Button
        intent="neutral"
        onPress={(event) => clearFilters(event.target)}
        size="sm"
        variant="ghost"
      >
        {resetLabel}
      </Button>
    </div>
  );
}

function chipOf(table: DataTableInstance<RowData>, filter: ColumnFilter): Chip {
  const column = table.getColumn(filter.id);
  const options = column?.columnDef.meta?.options;
  const text =
    options === undefined
      ? filterText(filter.value)
      : optionValues(filter.value)
          .map(
            (value) =>
              options.find((option) => option.value === value)?.label ?? value,
          )
          .join(', ');
  const name = column === undefined ? filter.id : columnLabel(column);
  return { id: filter.id, text: `${name}: ${text}` };
}

// A range of two shows its ends, an open end left out; other lists show each
// value.
function filterText(value: unknown): string {
  if (!Array.isArray(value)) return valueText(value) ?? '';
  const parts = value.map((part: unknown) => valueText(part) ?? '');
  return parts.join(parts.length === 2 ? '–' : ', ');
}

// The chips go with the last one, so focus moves to the search.
function removeChips(
  table: DataTableInstance<RowData>,
  ids: string[],
  chips: Chip[],
  root: HTMLElement | null,
) {
  if (root !== null && ids.length >= chips.length) focusSearch(root);
  for (const id of ids) table.getColumn(id)?.setFilterValue(undefined);
}
