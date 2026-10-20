import type { DataTableColumn } from '@oakoss/ui/hooks/use-data-table';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  bodyRows,
  type Payment,
  paymentColumns,
  payments,
  rowHeaders,
} from './data-table-demo';
import {
  facetTrigger,
  FiltersTable,
  openFacet,
  ServerFiltersTable,
} from './data-table-filters-demo';

const meta = {
  component: FiltersTable,
  title: 'Data/Data Table/Facets',
} satisfies Meta<typeof FiltersTable>;

export default meta;

type Story = StoryObj<typeof meta>;

const withUnpaid = [
  ...payments.slice(0, 3),
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- a status outside the type, as an API might send
  { ...payments[3], id: 'PAY-X', status: 'unpaid' } as unknown as Payment,
];

function withColumn(
  key: string,
  change: (column: DataTableColumn<Payment>) => DataTableColumn<Payment>,
) {
  return paymentColumns.map((column) =>
    'accessorKey' in column && column.accessorKey === key
      ? change(column)
      : column,
  );
}

const amountFacet = {
  columns: withColumn('amount', (column) => ({
    ...column,
    meta: {
      ...column.meta,
      options: [
        { label: '$100', value: '100' },
        { label: '$819', value: '819' },
      ],
    },
  })),
  extraFacet: 'amount',
};

// Each option reads its count as its description, so its name stays the
// label; choosing values filters to them and shows a chip, and choosing the
// last one again clears the filter. Three options need no search.
export const FacetCounts: Story = {
  play: async ({ canvas }) => {
    let list = await openFacet('Status');
    await expect(
      within(document.body).queryByRole('searchbox', {
        name: 'Search options',
      }),
    ).not.toBeInTheDocument();
    const paid = list.getByRole('option', { name: 'Paid' });
    await expect(paid).toHaveAccessibleDescription('9');
    await expect(
      list.getByRole('option', { name: 'Pending' }),
    ).toHaveAccessibleDescription('8');
    await userEvent.click(paid);
    await userEvent.keyboard('{Escape}');
    await expect(facetTrigger('Status')).toHaveAccessibleName(
      'Status 1 selected',
    );
    await expect(
      canvas.getByRole('row', { name: /Status: Paid/u }),
    ).toBeVisible();
    await expect(bodyRows(canvas)).toHaveLength(9);
    list = await openFacet('Status');
    await userEvent.click(list.getByRole('option', { name: 'Paid' }));
    await userEvent.keyboard('{Escape}');
    await expect(
      canvas.queryByRole('grid', { name: 'Active filters' }),
    ).not.toBeInTheDocument();
    await expect(bodyRows(canvas)).toHaveLength(10);
  },
};

// Counts follow the table's other filters.
export const CountsFollowSearch: Story = {
  args: { defaultState: { globalFilter: 'customer2' } },
  play: async () => {
    const list = await openFacet('Status');
    await expect(
      list.getByRole('option', { name: 'Paid' }),
    ).toHaveAccessibleDescription('2');
  },
};

// Counts passed in replace the rows' own, and a value they leave out counts 0.
export const CountsFromProps: Story = {
  args: { statusCounts: { paid: 99 } },
  play: async () => {
    const list = await openFacet('Status');
    await expect(
      list.getByRole('option', { name: 'Paid' }),
    ).toHaveAccessibleDescription('99');
    await expect(
      list.getByRole('option', { name: 'Pending' }),
    ).toHaveAccessibleDescription('0');
  },
};

// A faceted column matches values exactly, so "paid" doesn't match "unpaid".
export const ExactValues: Story = {
  args: { data: withUnpaid },
  play: async ({ canvas }) => {
    const list = await openFacet('Status');
    await userEvent.click(list.getByRole('option', { name: 'Paid' }));
    await userEvent.keyboard('{Escape}');
    await expect(rowHeaders(canvas)).toEqual(['PAY-001']);
  },
};

// A column in a group matches exactly too.
export const GroupedColumn: Story = {
  args: {
    // Every column sits in a group, so no header is a placeholder.
    columns: [
      { columns: paymentColumns.slice(1, 2), header: 'Order', id: 'order' },
      { columns: paymentColumns.slice(2, 4), header: 'Details', id: 'details' },
    ],
    data: withUnpaid,
  },
  play: async ({ canvas }) => {
    const list = await openFacet('Status');
    await userEvent.click(list.getByRole('option', { name: 'Paid' }));
    await userEvent.keyboard('{Escape}');
    await expect(rowHeaders(canvas)).toEqual(['PAY-001']);
  },
};

// A column's own filterFn wins, and receives the picked values.
export const OwnFilterFn: Story = {
  args: {
    columns: withColumn('status', (column) => ({
      ...column,
      filterFn: 'includesString',
    })),
    data: withUnpaid,
  },
  play: async ({ canvas }) => {
    const list = await openFacet('Status');
    await userEvent.click(list.getByRole('option', { name: 'Paid' }));
    await userEvent.keyboard('{Escape}');
    await expect(rowHeaders(canvas)).toEqual(['PAY-001', 'PAY-X']);
  },
};

// Options are strings, so a number column's values match and count by their
// text; a number and the same text count as one value.
export const NumberValues: Story = {
  args: {
    ...amountFacet,
    data: [
      ...payments,
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- an amount sent as text, as an API might
      { ...payments[5], amount: '100', id: 'PAY-S' } as unknown as Payment,
    ],
  },
  play: async ({ canvas }) => {
    const list = await openFacet('Amount');
    const hundred = list.getByRole('option', { name: '$100' });
    await expect(hundred).toHaveAccessibleDescription('2');
    await userEvent.click(hundred);
    await userEvent.keyboard('{Escape}');
    await expect(rowHeaders(canvas)).toEqual(['PAY-001', 'PAY-S']);
  },
};

// A single number stays set when another filter changes.
export const SingleNumberValue: Story = {
  args: {
    ...amountFacet,
    defaultState: { columnFilters: [{ id: 'amount', value: 100 }] },
  },
  play: async ({ canvas }) => {
    const list = await openFacet('Status');
    await userEvent.click(list.getByRole('option', { name: 'Paid' }));
    await userEvent.keyboard('{Escape}');
    await expect(rowHeaders(canvas)).toEqual(['PAY-001']);
    await expect(facetTrigger('Amount')).toHaveAccessibleName(
      'Amount 1 selected',
    );
  },
};

// A single value, as a URL might restore, counts as one pick everywhere.
export const SingleValue: Story = {
  args: { defaultState: { columnFilters: [{ id: 'status', value: 'paid' }] } },
  play: async ({ canvas }) => {
    await expect(bodyRows(canvas)).toHaveLength(9);
    await expect(facetTrigger('Status')).toHaveAccessibleName(
      'Status 1 selected',
    );
    await expect(
      canvas.getByRole('row', { name: /Status: Paid/u }),
    ).toBeVisible();
  },
};

// Picking two values keeps rows with either.
export const TwoValues: Story = {
  play: async ({ canvas }) => {
    const list = await openFacet('Customer');
    await userEvent.click(
      list.getByRole('option', { name: 'customer01@example.com' }),
    );
    await userEvent.click(
      list.getByRole('option', { name: 'customer02@example.com' }),
    );
    await userEvent.keyboard('{Escape}');
    await expect(rowHeaders(canvas)).toEqual(['PAY-001', 'PAY-002']);
  },
};

// Past seven options a search field leads the list and takes focus.
export const FacetSearch: Story = {
  play: async () => {
    const list = await openFacet('Customer');
    const search = within(document.body).getByRole('searchbox', {
      name: 'Search options',
    });
    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.keyboard('21');
    await waitFor(() => expect(list.getAllByRole('option')).toHaveLength(1));
  },
};

// A server table counts from the server's numbers, since its rows are one
// page.
export const ServerCounts: Story = {
  play: async ({ canvas }) => {
    const list = await openFacet('Status');
    await expect(
      list.getByRole('option', { name: 'Failed' }),
    ).toHaveAccessibleDescription('8');
    await userEvent.click(list.getByRole('option', { name: 'Paid' }));
    await userEvent.keyboard('{Escape}');
    await expect(bodyRows(canvas)).toHaveLength(9);
  },
  render: () => <ServerFiltersTable hasCounts />,
};

// Without the server's counts, options show none rather than one page's.
export const ServerWithoutCounts: Story = {
  play: async () => {
    const list = await openFacet('Status');
    await expect(
      list.getByRole('option', { name: 'Paid' }),
    ).not.toHaveAccessibleDescription();
  },
  render: () => <ServerFiltersTable hasCounts={false} />,
};
