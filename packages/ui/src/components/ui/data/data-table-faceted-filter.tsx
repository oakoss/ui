import type { Column, RowData } from '@tanstack/react-table';

import { useEffect, useRef } from 'react';
import {
  Autocomplete as AriaAutocomplete,
  Select as AriaSelect,
  type Key,
  useFilter,
} from 'react-aria-components';

import * as Icon from '#/components/icons';
import { Badge } from '#/components/ui/data/badge';
import { Button } from '#/components/ui/inputs/button';
import {
  ListBox,
  ListBoxItem,
  ListBoxPopover,
} from '#/components/ui/inputs/list-box';
import { SearchField } from '#/components/ui/inputs/search-field';
import {
  columnLabel,
  type DataTableFeatures,
  type DataTableOption,
  optionValues,
  useDataTableContext,
  valueText,
} from '#/hooks/use-data-table';

export type DataTableFacetedFilterProps = {
  column: string;
  // Each value's count when the server filters, since a page of rows can't
  // count the whole result.
  counts?: Readonly<Record<string, number>>;
  emptyLabel?: string;
  searchLabel?: string;
  // Options past this many get a search field.
  searchThreshold?: number;
  selectedLabel?: (count: number) => string;
  title?: string;
};

type FacetColumn = Column<DataTableFeatures, RowData>;

// Picks the values a column shows, from the options in its meta; each count
// follows the table's other filters.
export function DataTableFacetedFilter({
  column: columnId,
  counts,
  emptyLabel = 'No matches',
  searchLabel = 'Search options',
  searchThreshold = 7,
  selectedLabel = defaultSelectedLabel,
  title,
}: DataTableFacetedFilterProps) {
  const table = useDataTableContext();
  const column = table.getColumn(columnId);
  const options = column?.columnDef.meta?.options;
  if (column === undefined || options === undefined) {
    throw new Error(`A faceted filter's column "${columnId}" needs options.`);
  }
  const selected = optionValues(column.getFilterValue());
  const count = countOf(column, counts, table.options.manualFiltering === true);
  const name = title ?? columnLabel(column);
  return (
    <AriaSelect
      aria-label={name}
      data-slot="data-table-faceted-filter"
      onChange={(keys: Key[]) =>
        column.setFilterValue(keys.length > 0 ? keys.map(String) : undefined)
      }
      selectionMode="multiple"
      value={selected}
    >
      <FacetTrigger
        name={name}
        selected={selected.length > 0 ? selectedLabel(selected.length) : null}
      />
      <ListBoxPopover className="w-60" kind="select">
        <OptionList
          count={count}
          emptyLabel={emptyLabel}
          options={options}
          searchLabel={searchLabel}
          showsSearch={options.length > searchThreshold}
        />
      </ListBoxPopover>
    </AriaSelect>
  );
}

// A server table without counts shows none, since its rows are one page.
function countOf(
  column: FacetColumn,
  counts: Readonly<Record<string, number>> | undefined,
  isServer: boolean,
): (value: string) => null | number {
  if (counts !== undefined) return (value) => counts[value] ?? 0;
  if (isServer) return () => null;
  // Faceting keys each value as the row holds it; counts key it as the
  // filter reads it.
  const facets = new Map<string, number>();
  for (const [value, total] of column.getFacetedUniqueValues()) {
    const key = valueText(value);
    if (key !== undefined) facets.set(key, (facets.get(key) ?? 0) + total);
  }
  return (value) => facets.get(value) ?? 0;
}

function defaultSelectedLabel(count: number) {
  return `${String(count)} selected`;
}

// React Aria names the trigger by the Select's label alone, which would leave
// the count unheard, so the trigger names itself while values are chosen.
function FacetTrigger({
  name,
  selected,
}: {
  name: string;
  selected: null | string;
}) {
  return (
    <Button
      aria-label={selected === null ? undefined : `${name} ${selected}`}
      className="border-dashed"
      intent="neutral"
      size="sm"
      variant="outline"
    >
      <Icon.Plus aria-hidden data-icon="inline-start" />
      {name}
      {selected === null ? null : (
        <Badge className="ms-1" intent="neutral" variant="soft">
          {selected}
        </Badge>
      )}
    </Button>
  );
}

function optionalText(value: null | number) {
  return value === null ? undefined : String(value);
}

function OptionList({
  count,
  emptyLabel,
  options,
  searchLabel,
  showsSearch,
}: {
  count: (value: string) => null | number;
  emptyLabel: string;
  options: readonly DataTableOption[];
  searchLabel: string;
  showsSearch: boolean;
}) {
  const { contains } = useFilter({ sensitivity: 'base' });
  const searchRef = useRef<HTMLDivElement>(null);
  // The list mounts as the popover opens; typing goes to the search.
  useEffect(() => {
    searchRef.current?.querySelector('input')?.focus();
  }, []);
  const list = (
    <Options count={count} emptyLabel={emptyLabel} options={options} />
  );
  if (!showsSearch) return list;
  return (
    <AriaAutocomplete filter={contains}>
      <div className="p-1" ref={searchRef}>
        <SearchField aria-label={searchLabel} />
      </div>
      {list}
    </AriaAutocomplete>
  );
}

function Options({
  count,
  emptyLabel,
  options,
}: {
  count: (value: string) => null | number;
  emptyLabel: string;
  options: readonly DataTableOption[];
}) {
  return (
    <ListBox
      dependencies={[count]}
      emptyLabel={emptyLabel}
      items={options.map((option) => ({ ...option, id: option.value }))}
      kind="select"
    >
      {(option) => (
        // The count is the option's description, so its name stays the label.
        <ListBoxItem
          className="[&_[slot=description]]:ms-auto [&_[slot=description]]:text-xs [&_[slot=description]]:text-muted-foreground [&>span]:w-full [&>span]:flex-row [&>span]:items-center [&>span]:gap-2"
          description={optionalText(count(option.value))}
          id={option.value}
          kind="select"
          textValue={option.label}
        >
          {option.icon}
          {option.label}
        </ListBoxItem>
      )}
    </ListBox>
  );
}
