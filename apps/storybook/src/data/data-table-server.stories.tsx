import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  bodyRows,
  pageLabel,
  PaymentsTable,
  rowHeaders,
  ServerPaymentsTable,
} from './data-table-demo';

const meta = {
  component: ServerPaymentsTable,
  title: 'Data/Data Table/Server',
} satisfies Meta<typeof ServerPaymentsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

function query(canvas: ReturnType<typeof within>) {
  return JSON.parse(canvas.getByTestId('query').textContent ?? '{}') as unknown;
}

// The server sends one page and the total; the table pages from the total
// and shows the rows as sent.
export const Pages: Story = {
  play: async ({ canvas }) => {
    await expect(pageLabel(canvas)).toHaveTextContent('Page 1 of 3');
    await expect(canvas.getByRole('table')).toHaveAttribute(
      'aria-rowcount',
      '26',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(query(canvas)).toEqual({ page: 2, pageSize: 10 });
    await expect(rowHeaders(canvas)[0]).toBe('PAY-011');
    await expect(bodyRows(canvas)[0]).toHaveAttribute('aria-rowindex', '12');
  },
};

// The server sorts; a new order asks for the first page again.
export const Sorts: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    const header = canvas.getByRole('columnheader', { name: /Amount/u });
    await userEvent.click(within(header).getByRole('button'));
    await expect(query(canvas)).toEqual({
      page: 1,
      pageSize: 10,
      sort: 'amount',
    });
    await userEvent.click(within(header).getByRole('button'));
    await expect(query(canvas)).toEqual({
      page: 1,
      pageSize: 10,
      sort: '-amount',
    });
    await expect(rowHeaders(canvas)[0]).toBe('PAY-006');
  },
};

// Server pages are the app's to fetch, and a row's place in the page it came
// with isn't its place in the result, so a link never moves the page.
export const LinkedRowOnServer: Story = {
  args: { linkedRowId: 'PAY-015' },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(rowHeaders(canvas)).toContain('PAY-015');
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 50);
    });
    await expect(query(canvas)).toEqual({ page: 2, pageSize: 10 });
  },
};

// An empty page of a server result has no row counts to give, and its pager
// never claims a page past the total.
export const EmptyServerPage: Story = {
  args: { initialPage: 2, total: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table')).not.toHaveAttribute(
      'aria-rowcount',
    );
    await expect(pageLabel(canvas)).toHaveTextContent('Page 1 of 1');
  },
};

// A page emptied while the total stays gives no row counts either.
export const EmptyPageOfACountedResult: Story = {
  args: { total: 25 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table')).not.toHaveAttribute(
      'aria-rowcount',
    );
    await expect(pageLabel(canvas)).toHaveTextContent('Page 1 of 3');
  },
};

// A linked row in server rows that arrive later takes focus once they do.
export const LinkedRowArrivesLater: Story = {
  args: { isLoadedLater: true, linkedRowId: 'PAY-003' },
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByRole('rowheader', { name: 'PAY-003' })).toHaveFocus(),
    );
  },
};

// A link to a row on another page brings that page up, marks the row,
// scrolls it into view and focuses its header, once.
export const LinkedRow: StoryObj<typeof PaymentsTable> = {
  args: { linkedRowId: 'PAY-023' },
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(pageLabel(canvas)).toHaveTextContent('Page 3 of 3'),
    );
    const header = canvas.getByRole('rowheader', { name: 'PAY-023' });
    await expect(header.closest('tr')).toHaveAttribute('aria-current', 'true');
    await waitFor(() => expect(header).toHaveFocus());
    await userEvent.click(canvas.getByRole('button', { name: 'First page' }));
    await expect(pageLabel(canvas)).toHaveTextContent('Page 1 of 3');
  },
  render: (args) => <PaymentsTable {...args} />,
};
