import type { PaginationState } from '@tanstack/react-table';

import {
  DataTable,
  DataTableContent,
  DataTableToolbar,
} from '@oakoss/ui/components/ui/data/data-table';
import { DataTablePagination } from '@oakoss/ui/components/ui/data/data-table-pagination';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  type DataTableInstance,
  type DataTableState,
  useDataTable,
} from '@oakoss/ui/hooks/use-data-table';
import { type Dispatch, type SetStateAction, useState } from 'react';

import { type Payment, paymentColumns, payments } from './data-table-demo';

export type StateTableProps = {
  // Pagination the app owns and applies a tick later, as a router would.
  appPagination?: PaginationState;
  defaultState?: Partial<DataTableState>;
  isEmptyAtFirst?: boolean;
  linkedRowId?: string;
  onPaginationChange?: (pagination: PaginationState) => void;
  // A sort handler that changes the page size itself.
  resizesOnSort?: boolean;
  state?: Partial<DataTableState>;
};

// Toolbar buttons drive the table the way app code would.
export function StateTable({
  appPagination,
  defaultState,
  isEmptyAtFirst = false,
  linkedRowId,
  onPaginationChange,
  resizesOnSort = false,
  state,
}: StateTableProps) {
  const [data, setData] = useState(isEmptyAtFirst ? [] : payments);
  const [pagination, setPagination] = useState(appPagination);
  const [linked, setLinked] = useState(linkedRowId);
  const table = useDataTable({
    columns: paymentColumns,
    data,
    defaultState,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onPaginationChange: (next) => {
      onPaginationChange?.(next);
      if (pagination) setTimeout(() => setPagination(next), 0);
    },
    onSortingChange: () => {
      if (resizesOnSort) table.setPageSize(25);
    },
    state: pagination ? { ...state, pagination } : state,
  });
  return (
    <DataTable className="w-4xl max-w-full" table={table}>
      {pagination ? (
        <AppToolbar
          onLink={setLinked}
          pagination={pagination}
          setPagination={setPagination}
        />
      ) : null}
      <StateToolbar setData={setData} table={table} />
      <DataTableContent
        aria-label="Payments"
        isLoading={data.length === 0}
        linkedRowId={linked}
      />
      <DataTablePagination />
    </DataTable>
  );
}

// Changes the app makes to state it owns, outside the table's handlers.
function AppToolbar({
  onLink,
  pagination,
  setPagination,
}: {
  onLink: (id: string) => void;
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
}) {
  return (
    <DataTableToolbar>
      <Button onPress={() => setPagination({ ...pagination, pageIndex: 2 })}>
        App to page 3
      </Button>
      <Button
        onPress={() => {
          setPagination({ pageIndex: 2, pageSize: 20 });
          onLink('PAY-005');
        }}
      >
        App resizes and links
      </Button>
    </DataTableToolbar>
  );
}

function StateToolbar({
  setData,
  table,
}: {
  setData: Dispatch<SetStateAction<Payment[]>>;
  table: DataTableInstance<Payment>;
}) {
  return (
    <DataTableToolbar>
      <Button onPress={() => setData(payments)}>Load</Button>
      <Button onPress={() => setData([])}>Clear</Button>
      <Button onPress={() => setData((rows) => rows.slice(0, 15))}>
        Remove 10
      </Button>
      <Button onPress={() => table.setGlobalFilter('customer')}>Search</Button>
      <Button
        onPress={() => table.getColumn('amount')?.setFilterValue([200, 800])}
      >
        Amounts 200–800
      </Button>
      <Button
        onPress={() => {
          const [first, second] = table.getRowModel().rows;
          first?.toggleSelected(true);
          second?.toggleSelected(true);
        }}
      >
        Select two
      </Button>
    </DataTableToolbar>
  );
}
