import {
  DataTable,
  DataTableContent,
  DataTableToolbar,
} from '@oakoss/ui/components/ui/data/data-table';
import { DataTableFacetedFilter } from '@oakoss/ui/components/ui/data/data-table-faceted-filter';
import { DataTableFilterChips } from '@oakoss/ui/components/ui/data/data-table-filter-chips';
import { DataTablePagination } from '@oakoss/ui/components/ui/data/data-table-pagination';
import { DataTableSearch } from '@oakoss/ui/components/ui/data/data-table-search';
import { DataTableViewOptions } from '@oakoss/ui/components/ui/data/data-table-view-options';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  type DataTableColumn,
  type DataTableState,
  useDataTable,
  useDataTableContext,
} from '@oakoss/ui/hooks/use-data-table';
import { useMemo, useState } from 'react';
import { screen, userEvent, within } from 'storybook/test';

import { type Payment, paymentColumns, payments } from './data-table-demo';

export type FiltersTableProps = {
  // How long the app takes to apply a search, as a router might.
  appCommitMs?: number;
  // Search the app controls, with a button that changes it from outside.
  appSearch?: string;
  columns?: DataTableColumn<Payment>[];
  data?: Payment[];
  defaultState?: Partial<DataTableState>;
  extraFacet?: string;
  searchColumn?: string;
  statusCounts?: Record<string, number>;
};

// In the toolbar, apart from the column header's sort button of the same name.
export function facetTrigger(name: string) {
  const toolbar = document.querySelector<HTMLElement>(
    '[data-slot=data-table-toolbar]',
  );
  return within(toolbar ?? document.body).getByRole('button', {
    name: new RegExp(`^${name}`, 'u'),
  });
}

// Search, a Status facet, a Customer facet with enough options to search,
// and the active filters.
export function FiltersTable({
  appCommitMs,
  appSearch,
  columns,
  data = payments,
  defaultState,
  extraFacet,
  searchColumn,
  statusCounts,
}: FiltersTableProps) {
  const [search, setSearch] = useState(appSearch);
  const customerColumns = useMemo(
    () => withCustomerOptions(columns ?? paymentColumns, data),
    [columns, data],
  );
  const commit = (value: string) => {
    if (appCommitMs === undefined) setSearch(value);
    else setTimeout(() => setSearch(value), appCommitMs);
  };
  const table = useDataTable({
    columns: customerColumns,
    data,
    defaultState,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onGlobalFilterChange: search === undefined ? undefined : commit,
    state: search === undefined ? undefined : { globalFilter: search },
  });
  return (
    <DataTable className="w-4xl max-w-full" table={table}>
      <DataTableToolbar>
        <DataTableSearch aria-label="Search payments" column={searchColumn} />
        <DataTableFacetedFilter column="status" counts={statusCounts} />
        <DataTableFacetedFilter column="email" title="Customer" />
        {extraFacet === undefined ? null : (
          <DataTableFacetedFilter column={extraFacet} />
        )}
        <DataTableViewOptions />
        <AppControls
          onSearch={
            search === undefined ? undefined : () => setSearch('customer1')
          }
        />
      </DataTableToolbar>
      <DataTableFilterChips />
      <DataTableContent aria-label="Payments" />
      <DataTablePagination />
    </DataTable>
  );
}

export async function openFacet(name: string) {
  await userEvent.click(facetTrigger(name));
  return within(await screen.findByRole('listbox'));
}

// Changes the app makes to the search from outside the table.
function AppControls({ onSearch }: { onSearch: (() => void) | undefined }) {
  const table = useDataTableContext();
  return (
    <>
      <Button onPress={() => table.resetGlobalFilter(true)}>
        App resets search
      </Button>
      {onSearch === undefined ? null : (
        <Button onPress={onSearch}>App search</Button>
      )}
    </>
  );
}

function withCustomerOptions(
  columns: DataTableColumn<Payment>[],
  data: Payment[],
): DataTableColumn<Payment>[] {
  const options = [...new Set(data.map((payment) => payment.email))]
    .toSorted((a, b) => a.localeCompare(b))
    .map((email) => ({ label: email, value: email }));
  const withOptions = (
    column: DataTableColumn<Payment>,
  ): DataTableColumn<Payment> => {
    if ('columns' in column && column.columns !== undefined) {
      return {
        ...column,
        columns: column.columns.map((child) => withOptions(child)),
      };
    }
    return 'accessorKey' in column && column.accessorKey === 'email'
      ? { ...column, meta: { ...column.meta, options } }
      : column;
  };
  return columns.map((column) => withOptions(column));
}

const statuses = ['paid', 'pending', 'failed'] as const;

// A server stand-in that filters by status itself and counts each status
// across the whole result, as an API would.
export function ServerFiltersTable({ hasCounts }: { hasCounts: boolean }) {
  const [state, setState] = useState<
    Pick<DataTableState, 'columnFilters' | 'pagination'>
  >({ columnFilters: [], pagination: { pageIndex: 0, pageSize: 10 } });
  const picked = state.columnFilters.find((filter) => filter.id === 'status');
  const wanted = Array.isArray(picked?.value) ? picked.value : [];
  const matching = payments.filter(
    (payment) => wanted.length === 0 || wanted.includes(payment.status),
  );
  const start = state.pagination.pageIndex * state.pagination.pageSize;
  const table = useDataTable({
    columns: paymentColumns,
    data: matching.slice(start, start + state.pagination.pageSize),
    getRowId: (row) => row.id,
    mode: 'server',
    onColumnFiltersChange: (columnFilters) =>
      setState((previous) => ({ ...previous, columnFilters })),
    onPaginationChange: (pagination) =>
      setState((previous) => ({ ...previous, pagination })),
    rowCount: matching.length,
    state,
  });
  const counts = Object.fromEntries(
    statuses.map((status) => [
      status,
      payments.filter((payment) => payment.status === status).length,
    ]),
  );
  return (
    <DataTable className="w-4xl max-w-full" table={table}>
      <DataTableToolbar>
        <DataTableFacetedFilter
          column="status"
          counts={hasCounts ? counts : undefined}
        />
      </DataTableToolbar>
      <DataTableContent aria-label="Payments" />
      <DataTablePagination />
    </DataTable>
  );
}
