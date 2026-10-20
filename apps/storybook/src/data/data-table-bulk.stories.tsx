import type { DataTableSelection } from '@oakoss/ui/hooks/use-data-table';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { BulkPaymentsTable } from './data-table-bulk-demo';
import { bodyRows } from './data-table-demo';
import { openFacet } from './data-table-filters-demo';

const meta = {
  component: BulkPaymentsTable,
  title: 'Data/Data Table/Bulk Actions',
} satisfies Meta<typeof BulkPaymentsTable>;

export default meta;

type Canvas = ReturnType<typeof within>;

type Story = StoryObj<typeof meta>;

async function confirmDelete(canvas: Canvas, count: number) {
  await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));
  const dialog = await screen.findByRole('alertdialog', {
    name: `Delete ${String(count)} ${count === 1 ? 'payment' : 'payments'}?`,
  });
  await expect(
    within(dialog).getByRole('button', { name: 'Cancel' }),
  ).toHaveFocus();
  await userEvent.click(
    within(dialog).getByRole('button', { name: `Delete ${String(count)}` }),
  );
}

function pageBox(canvas: Canvas) {
  return canvas.getByRole('checkbox', { name: 'Select all on this page' });
}

async function selectAllMatching(canvas: Canvas, count: number) {
  await userEvent.click(pageBox(canvas));
  const all = canvas.queryByRole('button', {
    name: `Select all ${String(count)} matching`,
  });
  if (all !== null) await userEvent.click(all);
  await expect(canvas.getByText(`All ${String(count)} selected`)).toBeVisible();
}

// A server table counts everything matching from its total, and unticking a
// row leaves the rest.
export const ServerAllMatching: Story = {
  play: async ({ canvas }) => {
    await selectAllMatching(canvas, 25);
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select PAY-003' }),
    );
    await expect(canvas.getByText('24 selected')).toBeVisible();
  },
};

// A filter change ends a selection of everything matching in the app's own
// state too, not only on screen.
export const FilterChangeTellsTheApp: Story = {
  args: { onSelectionChange: fn<(selection: DataTableSelection) => void>() },
  play: async ({ args, canvas }) => {
    await selectAllMatching(canvas, 25);
    const list = await openFacet('Status');
    await userEvent.click(list.getByRole('option', { name: /Pending/u }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(args.onSelectionChange).toHaveBeenLastCalledWith({ ids: [] }),
    );
  },
};

// Narrowing a facet already in use is a new filter too.
export const FilterValueChangeEnds: Story = {
  args: { onSelectionChange: fn<(selection: DataTableSelection) => void>() },
  play: async ({ args, canvas }) => {
    const list = await openFacet('Status');
    await userEvent.click(list.getByRole('option', { name: /Pending/u }));
    await userEvent.click(list.getByRole('option', { name: /Failed/u }));
    await userEvent.keyboard('{Escape}');
    await selectAllMatching(canvas, 16);
    const again = await openFacet('Status');
    await userEvent.click(again.getByRole('option', { name: /Failed/u }));
    await userEvent.keyboard('{Escape}');
    await expect(
      canvas.queryByRole('toolbar', { name: 'Selected rows' }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(args.onSelectionChange).toHaveBeenLastCalledWith({ ids: [] }),
    );
  },
};

// Emptying the last page brings up the one before it, as a server would.
export const DeleteStepsBackAPage: Story = {
  play: async ({ canvas }) => {
    const list = await openFacet('Status');
    await userEvent.click(list.getByRole('option', { name: /Pending/u }));
    await userEvent.click(list.getByRole('option', { name: /Failed/u }));
    await userEvent.keyboard('{Escape}');
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await userEvent.click(pageBox(canvas));
    await confirmDelete(canvas, 6);
    await waitFor(() => expect(canvas.getByText('Page 1 of 1')).toBeVisible());
    await expect(bodyRows(canvas)).toHaveLength(10);
  },
};

// A delete under a filter acts on everything it matches, not only the
// loaded page. The bar goes with the selection, and with no rows left focus
// moves to Clear filters.
export const DeleteAllMatching: Story = {
  play: async ({ canvas }) => {
    const list = await openFacet('Status');
    await userEvent.click(list.getByRole('option', { name: /Pending/u }));
    await userEvent.click(list.getByRole('option', { name: /Failed/u }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.getByText('Page 1 of 2')).toBeVisible());
    await selectAllMatching(canvas, 16);
    await confirmDelete(canvas, 16);
    await expect(canvas.getByText('Deleted 16 of 16.')).toBeVisible();
    await expect(bodyRows(canvas)).toHaveLength(1);
    await waitFor(() =>
      expect(
        canvas.queryByRole('toolbar', { name: 'Selected rows' }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Clear filters' }),
      ).toHaveFocus(),
    );
  },
};

// Deleting the selected rows of a page that keeps rows hands focus to the
// page's select box.
export const DeleteFocusesPageBox: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select PAY-002' }),
    );
    await confirmDelete(canvas, 1);
    await waitFor(() => expect(pageBox(canvas)).toHaveFocus());
  },
};

// Rows the server refuses stay selected, and the alert says why.
export const PartialFailure: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select PAY-001' }),
    );
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select PAY-002' }),
    );
    await confirmDelete(canvas, 2);
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Deleted 1 of 2. 1 couldn’t be deleted: Paid payments can’t be deleted.',
    );
    await expect(canvas.getByText('1 selected')).toBeVisible();
    await expect(
      canvas.getByRole('checkbox', { name: 'Select PAY-001' }),
    ).toBeChecked();
  },
};
