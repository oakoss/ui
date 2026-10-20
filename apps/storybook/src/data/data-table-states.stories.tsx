import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { expect } from 'storybook/test';

import { bodyRows, PaymentsTable } from './data-table-demo';

const meta = {
  component: PaymentsTable,
  title: 'Data/Data Table/States',
} satisfies Meta<typeof PaymentsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

// The first load shows skeleton rows hidden from assistive tech, a visually
// hidden row saying what they stand for, and a busy table. Loading wins over
// an error and gives no row counts.
export const Loading: Story = {
  args: {
    defaultState: { pagination: { pageIndex: 0, pageSize: 50 } },
    error: 'Payments failed to load.',
    isLoading: true,
  },
  play: async ({ canvas }) => {
    const table = canvas.getByRole('table');
    await expect(table).toHaveAttribute('aria-busy', 'true');
    await expect(
      canvas.getByRole('cell', { name: 'Loading' }),
    ).toBeInTheDocument();
    // At most ten rows, one skeleton per column.
    await expect(table.querySelectorAll('[data-slot=skeleton]')).toHaveLength(
      70,
    );
    await expect(table).not.toHaveAttribute('aria-rowcount');
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};

// Rows still loading have no place in the result to give.
export const LoadingGivesNoRowCount: Story = {
  args: { isLoading: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table')).not.toHaveAttribute(
      'aria-rowcount',
    );
  },
};

// A refetch keeps the rows on screen, faded, while the table is busy.
export const Refetching: Story = {
  args: { isRefetching: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await expect(bodyRows(canvas)).toHaveLength(10);
    const [, body] = canvas.getAllByRole('rowgroup');
    await expect(getComputedStyle(body ?? document.body).opacity).toBe('0.6');
  },
};

// A failed refetch keeps the rows readable under an alert, which can hold a
// retry.
export const ErrorState: Story = {
  args: {
    error: (
      <>
        Payments failed to load.{' '}
        <Button size="sm" variant="outline">
          Retry
        </Button>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Payments failed to load.',
    );
    await expect(canvas.getByRole('button', { name: 'Retry' })).toBeVisible();
    await expect(
      canvas.getByRole('rowheader', { name: 'PAY-001' }),
    ).toBeVisible();
    const [first] = bodyRows(canvas);
    await expect(first).toHaveAttribute('data-slot', 'data-table-error');
    await expect(first).toContainElement(canvas.getByRole('alert'));
    await expect(first?.firstElementChild).toHaveAttribute('colspan', '7');
    await expect(canvas.getByRole('table')).not.toHaveAttribute(
      'aria-rowcount',
    );
  },
};

// A first load that fails has no rows to keep, so the error takes their place.
export const ErrorOnFirstLoad: Story = {
  args: { data: [], error: 'Payments failed to load.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Payments failed to load.',
    );
    await expect(canvas.queryByText('No data.')).not.toBeInTheDocument();
  },
};

// `isError && message` passes false when nothing failed, which keeps the rows.
export const NoErrorWhenFalse: Story = {
  args: { error: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await expect(bodyRows(canvas)).toHaveLength(10);
  },
};

// With no data the body is one row spanning every column.
export const Empty: Story = {
  args: { data: [] },
  play: async ({ canvas }) => {
    const cell = canvas.getByRole('cell', { name: 'No data.' });
    await expect(cell).toHaveAttribute('colspan', '7');
  },
};

// A filter that matches nothing says so, rather than that there's no data.
export const NoResults: Story = {
  args: { defaultState: { globalFilter: 'nobody' } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('cell', { name: 'No results.' }),
    ).toBeVisible();
  },
};

// Every label is a prop, for translation or other wording.
export const CustomLabels: Story = {
  args: { data: [], emptyLabel: 'No payments yet.' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('cell', { name: 'No payments yet.' }),
    ).toBeVisible();
  },
};
