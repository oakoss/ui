import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { bodyRows, PaymentsTable } from './data-table-demo';
import { FiltersTable, openFacet } from './data-table-filters-demo';
import { StateTable } from './data-table-state-demo';

const meta = {
  component: PaymentsTable,
  title: 'Data/Data Table/Action Bar',
} satisfies Meta<typeof PaymentsTable>;

export default meta;

type Canvas = ReturnType<typeof within>;

type Story = StoryObj<typeof meta>;

function bar(canvas: Canvas) {
  return canvas.queryByRole('toolbar', { name: 'Selected rows' });
}

function pageBox(canvas: Canvas) {
  return canvas.getByRole('checkbox', { name: 'Select all on this page' });
}

function rowBox(canvas: Canvas, id: string) {
  return canvas.getByRole('checkbox', { name: `Select ${id}` });
}

async function selectAllMatching(canvas: Canvas) {
  await userEvent.click(pageBox(canvas));
  await userEvent.click(
    canvas.getByRole('button', { name: 'Select all 25 matching' }),
  );
  await expect(canvas.getByText('All 25 selected')).toBeVisible();
}

// The bar appears after the table, so the rows being ticked stay put.
export const AppearsWithoutMovingRows: Story = {
  play: async ({ canvas }) => {
    await expect(bar(canvas)).not.toBeInTheDocument();
    const [first] = bodyRows(canvas);
    const top = first?.getBoundingClientRect().top;
    await userEvent.click(rowBox(canvas, 'PAY-001'));
    await expect(bar(canvas)).toBeVisible();
    await expect(canvas.getByText('1 selected')).toBeVisible();
    await expect(first?.getBoundingClientRect().top).toBe(top);
  },
};

// With the whole page ticked, the bar offers every matching row; once
// pressed, focus moves to Clear, and the next page's rows read selected.
export const SelectAllMatching: Story = {
  play: async ({ canvas }) => {
    await selectAllMatching(canvas);
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Clear selection' }),
      ).toHaveFocus(),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(pageBox(canvas)).toBeChecked();
    await expect(rowBox(canvas, 'PAY-011')).toBeChecked();
  },
};

// Unticking a row under all-matching leaves the rest selected.
export const UntickUnderAllMatching: Story = {
  play: async ({ canvas }) => {
    await selectAllMatching(canvas);
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await userEvent.click(rowBox(canvas, 'PAY-012'));
    await expect(canvas.getByText('24 selected')).toBeVisible();
    await expect(pageBox(canvas)).toBePartiallyChecked();
  },
};

// Rows that can't be selected stay unticked and uncounted under
// all-matching.
export const DisabledRowsUnderAllMatching: Story = {
  args: { canSelect: (payment) => payment.status !== 'failed' },
  play: async ({ canvas }) => {
    await userEvent.click(pageBox(canvas));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Select all 17 matching' }),
    );
    await expect(canvas.getByText('All 17 selected')).toBeVisible();
    await expect(rowBox(canvas, 'PAY-003')).toBeDisabled();
    await expect(rowBox(canvas, 'PAY-003')).not.toBeChecked();
    await expect(rowBox(canvas, 'PAY-001')).toBeChecked();
  },
};

// A search the app sets from outside the table, such as from the URL, ends
// a selection of everything matching too, and clearing the search again
// doesn't bring it back.
export const AppSearchEndsAllMatching: Story = {
  play: async ({ canvas }) => {
    await selectAllMatching(canvas);
    await userEvent.click(canvas.getByRole('button', { name: 'App search' }));
    await expect(bar(canvas)).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'App resets search' }),
    );
    await waitFor(() => expect(bodyRows(canvas)).toHaveLength(10));
    await expect(bar(canvas)).not.toBeInTheDocument();
  },
  render: () => <FiltersTable appSearch="" />,
};

// Made again after the table ended it, it still ends on an app search.
export const EndsAgainAfterReselecting: Story = {
  play: async ({ canvas }) => {
    await selectAllMatching(canvas);
    const list = await openFacet('Status');
    await userEvent.click(list.getByRole('option', { name: /Pending/u }));
    await userEvent.click(list.getByRole('option', { name: /Pending/u }));
    await userEvent.keyboard('{Escape}');
    await expect(bar(canvas)).not.toBeInTheDocument();
    await selectAllMatching(canvas);
    await userEvent.click(canvas.getByRole('button', { name: 'App search' }));
    await expect(bar(canvas)).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'App resets search' }),
    );
    await waitFor(() => expect(bodyRows(canvas)).toHaveLength(10));
    await expect(bar(canvas)).not.toBeInTheDocument();
  },
  render: () => <FiltersTable appSearch="" />,
};

// Rows a filter hides don't count toward the page, so the bar still offers
// the matching rows left unselected.
export const SelectAllPastHiddenRows: Story = {
  play: async ({ canvas }) => {
    for (const id of ['PAY-001', 'PAY-004', 'PAY-007', 'PAY-010']) {
      await userEvent.click(rowBox(canvas, id));
    }
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    for (const id of ['PAY-013', 'PAY-016', 'PAY-019']) {
      await userEvent.click(rowBox(canvas, id));
    }
    const list = await openFacet('Status');
    await userEvent.click(list.getByRole('option', { name: /Pending/u }));
    await userEvent.click(list.getByRole('option', { name: /Failed/u }));
    await userEvent.keyboard('{Escape}');
    await userEvent.click(pageBox(canvas));
    await expect(
      canvas.getByRole('button', { name: 'Select all 16 matching' }),
    ).toBeVisible();
  },
  render: () => <FiltersTable />,
};

// The count leaves out selected rows the data has dropped, matching the rows
// an action gets.
export const RemovedRowsLeaveTheCount: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(rowBox(canvas, 'PAY-001'));
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await userEvent.click(rowBox(canvas, 'PAY-020'));
    await expect(canvas.getByText('2 selected')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove 10' }));
    await expect(canvas.getByText('1 selected')).toBeVisible();
  },
  render: () => <StateTable />,
};

// A client action reads the rows themselves, the unticked ones left out.
export const ClientActionGetsRows: Story = {
  args: { showSelected: true },
  play: async ({ canvas }) => {
    await selectAllMatching(canvas);
    await userEvent.click(rowBox(canvas, 'PAY-003'));
    const rows = canvas.getByTestId('selected-rows').textContent.split(' ');
    await expect(rows).toHaveLength(24);
    await expect(rows).not.toContain('PAY-003');
  },
};

// A sort keeps every matching row selected.
export const SortKeepsAllMatching: Story = {
  play: async ({ canvas }) => {
    await selectAllMatching(canvas);
    const header = canvas.getByRole('columnheader', { name: /Amount/u });
    await userEvent.click(within(header).getByRole('button'));
    await expect(canvas.getByText('All 25 selected')).toBeVisible();
  },
};

// Unticking every row ends the selection.
export const UntickingEverythingClears: Story = {
  args: { defaultState: { pagination: { pageIndex: 0, pageSize: 25 } } },
  play: async ({ canvas }) => {
    await userEvent.click(pageBox(canvas));
    await expect(
      canvas.queryByRole('button', { name: /Select all/u }),
    ).not.toBeInTheDocument();
    await userEvent.click(pageBox(canvas));
    await expect(bar(canvas)).not.toBeInTheDocument();
  },
};

// Clear ends the selection and hands focus to the page's select box, which
// stays in the table when the bar goes.
export const ClearMovesFocus: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(rowBox(canvas, 'PAY-001'));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear selection' }),
    );
    await expect(bar(canvas)).not.toBeInTheDocument();
    await expect(rowBox(canvas, 'PAY-001')).not.toBeChecked();
    await waitFor(() => expect(pageBox(canvas)).toHaveFocus());
  },
};

// The bar is a toolbar: arrow keys move between its controls.
export const ArrowKeysMove: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(pageBox(canvas));
    const selectAll = canvas.getByRole('button', {
      name: 'Select all 25 matching',
    });
    const clear = canvas.getByRole('button', { name: 'Clear selection' });
    selectAll.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(clear).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(selectAll).toHaveFocus();
  },
};

// Escape inside the bar clears the selection.
export const EscapeClears: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(rowBox(canvas, 'PAY-001'));
    canvas.getByRole('button', { name: 'Clear selection' }).focus();
    await userEvent.keyboard('{Escape}');
    await expect(bar(canvas)).not.toBeInTheDocument();
    await waitFor(() => expect(pageBox(canvas)).toHaveFocus());
  },
};

// Tabbing down a page taller than the screen, each row's box scrolls into
// view above the sticky bar rather than under it.
export const FocusClearsTheBar: Story = {
  args: { defaultState: { pagination: { pageIndex: 0, pageSize: 25 } } },
  play: async ({ canvas }) => {
    await userEvent.click(rowBox(canvas, 'PAY-001'));
    const toolbar = bar(canvas);
    const covered: string[] = [];
    for (let row = 2; row <= 25; row += 1) {
      await userEvent.tab();
      await userEvent.tab();
      const box = document.activeElement;
      if (
        box !== null &&
        toolbar !== null &&
        box.getBoundingClientRect().bottom > toolbar.getBoundingClientRect().top
      ) {
        covered.push(box.getAttribute('aria-label') ?? '');
      }
    }
    await expect(covered).toEqual([]);
    await expect(rowBox(canvas, 'PAY-025')).toHaveFocus();
  },
};

// Selected rows a filter hides still count, and the bar says how many.
export const HiddenByFilter: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(rowBox(canvas, 'PAY-001'));
    await userEvent.click(rowBox(canvas, 'PAY-004'));
    await userEvent.click(rowBox(canvas, 'PAY-002'));
    const list = await openFacet('Status');
    await userEvent.click(list.getByRole('option', { name: /Pending/u }));
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByText('3 selected')).toBeVisible();
    await expect(canvas.getByText('(2 hidden by filter)')).toBeVisible();
  },
  render: () => <FiltersTable />,
};

// A filter change ends a selection of everything matching, and says so.
export const FilterEndsAllMatching: Story = {
  play: async ({ canvas }) => {
    await selectAllMatching(canvas);
    const list = await openFacet('Status');
    await userEvent.click(list.getByRole('option', { name: /Pending/u }));
    await userEvent.keyboard('{Escape}');
    await expect(bar(canvas)).not.toBeInTheDocument();
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Selection cleared'),
    );
  },
  render: () => <FiltersTable />,
};
