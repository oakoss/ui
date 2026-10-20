import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  bodyRows,
  pageLabel,
  PaymentsTable,
  rowHeaders,
} from './data-table-demo';

const meta = {
  component: PaymentsTable,
  title: 'Data/Data Table',
} satisfies Meta<typeof PaymentsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

function sortButton(canvas: ReturnType<typeof within>, name: string) {
  const header = canvas.getByRole('columnheader', {
    name: new RegExp(name, 'u'),
  });
  return { button: within(header).getByRole('button'), header };
}

// The first page of ten, each row headed by its payment. Row counts place
// the page in the whole result: 25 rows plus the header row.
export const Default: Story = {
  play: async ({ canvas }) => {
    const table = canvas.getByRole('table', { name: 'Payments' });
    await expect(bodyRows(canvas)).toHaveLength(10);
    await expect(table).toHaveAttribute('aria-rowcount', '26');
    const [header] = canvas.getAllByRole('row');
    await expect(header).toHaveAttribute('aria-rowindex', '1');
    await expect(bodyRows(canvas)[0]).toHaveAttribute('aria-rowindex', '2');
    await expect(
      canvas.getByRole('rowheader', { name: 'PAY-001' }),
    ).toBeVisible();
    await expect(canvas.getByText('Page 1 of 3')).toBeVisible();
  },
};

// A table that shows every row has no counts to give.
export const AllRowsShown: Story = {
  args: { defaultState: { pagination: { pageIndex: 0, pageSize: 50 } } },
  play: async ({ canvas }) => {
    await expect(bodyRows(canvas)).toHaveLength(25);
    await expect(canvas.getByRole('table')).not.toHaveAttribute(
      'aria-rowcount',
    );
    await expect(bodyRows(canvas)[0]).not.toHaveAttribute('aria-rowindex');
  },
};

// Page two's rows continue the count from page one.
export const RowIndexOnLaterPages: Story = {
  args: { defaultState: { pagination: { pageIndex: 1, pageSize: 10 } } },
  play: async ({ canvas }) => {
    await expect(bodyRows(canvas)[0]).toHaveAttribute('aria-rowindex', '12');
    await expect(bodyRows(canvas)[1]).toHaveAttribute('aria-rowindex', '13');
    await expect(rowHeaders(canvas)[0]).toBe('PAY-011');
  },
};

// A negative page, from a bad link or app state, steps up to the first.
export const NegativePage: Story = {
  args: { defaultState: { pagination: { pageIndex: -1, pageSize: 10 } } },
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(pageLabel(canvas)).toHaveTextContent('Page 1 of 3'),
    );
    await expect(rowHeaders(canvas)[0]).toBe('PAY-001');
  },
};
// A header press sorts ascending, then descending, then clears.
export const SortCycle: Story = {
  play: async ({ canvas }) => {
    const { button, header } = sortButton(canvas, 'Amount');
    await userEvent.click(button);
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await expect(rowHeaders(canvas)[0]).toBe('PAY-001');
    await userEvent.click(button);
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await expect(rowHeaders(canvas)[0]).toBe('PAY-006');
    await userEvent.click(button);
    await expect(header).not.toHaveAttribute('aria-sort');
    await expect(rowHeaders(canvas)[0]).toBe('PAY-001');
  },
};

// Shift adds a column to the order. Only the first carries aria-sort, which
// ARIA allows on one header; each shows its place in the order.
export const MultiSort: Story = {
  play: async ({ canvas }) => {
    const status = sortButton(canvas, 'Status');
    const amount = sortButton(canvas, 'Amount');
    const user = userEvent.setup();
    await user.click(status.button);
    await user.keyboard('{Shift>}');
    await user.click(amount.button);
    await user.keyboard('{/Shift}');
    await expect(status.header).toHaveAttribute('aria-sort', 'ascending');
    await expect(amount.header).not.toHaveAttribute('aria-sort');
    await expect(status.button).toHaveTextContent('1');
    await expect(amount.button).toHaveTextContent('2');
    await expect(rowHeaders(canvas).slice(0, 2)).toEqual([
      'PAY-015',
      'PAY-024',
    ]);
  },
};

// A new order starts at its first page, where its top rows are.
export const SortShowsFirstPage: Story = {
  args: { defaultState: { pagination: { pageIndex: 2, pageSize: 10 } } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Page 3 of 3')).toBeVisible();
    await userEvent.click(sortButton(canvas, 'Amount').button);
    await expect(canvas.getByText('Page 1 of 3')).toBeVisible();
  },
};

// Sorting, paging and selecting change the table without moving focus, so a
// polite status region says what changed.
export const Announcements: Story = {
  play: async ({ canvas }) => {
    const status = canvas.getByRole('status');
    await expect(status).toBeEmptyDOMElement();
    await userEvent.click(sortButton(canvas, 'Amount').button);
    await waitFor(() =>
      expect(status).toHaveTextContent('Sorted by Amount, ascending'),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(status).toHaveTextContent('Page 2 of 3'));
    const [row] = bodyRows(canvas);
    await userEvent.click(within(row ?? document.body).getByRole('checkbox'));
    await waitFor(() => expect(status).toHaveTextContent('1 row selected'));
    const amount = sortButton(canvas, 'Amount').button;
    await userEvent.click(amount);
    await userEvent.click(amount);
    await waitFor(() => expect(status).toHaveTextContent('Sorting cleared'));
  },
};
