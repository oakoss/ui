import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { DataTable } from '#/components/ui/data/data-table';
import { DataTableFacetedFilter } from '#/components/ui/data/data-table-faceted-filter';
import { useDataTable } from '#/hooks/use-data-table';

type Payment = { amount: number; id: string };

function FacetTable({ column }: { column: string }) {
  const table = useDataTable<Payment>({
    columns: [{ accessorKey: 'amount', header: 'Amount' }],
    data: [{ amount: 1, id: 'a' }],
  });
  return createElement(
    DataTable<Payment>,
    { table },
    createElement(DataTableFacetedFilter, { column }),
  );
}

test('a faceted filter needs its column to list options', () => {
  expect(() =>
    renderToStaticMarkup(createElement(FacetTable, { column: 'amount' })),
  ).toThrow('A faceted filter\'s column "amount" needs options.');
  expect(() =>
    renderToStaticMarkup(createElement(FacetTable, { column: 'missing' })),
  ).toThrow('A faceted filter\'s column "missing" needs options.');
});
