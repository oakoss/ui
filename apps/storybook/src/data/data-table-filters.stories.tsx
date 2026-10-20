import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { phoneWidth } from '#/helpers/viewport';

import { bodyRows, rowHeaders } from './data-table-demo';
import { FiltersTable } from './data-table-filters-demo';

const meta = {
  component: FiltersTable,
  title: 'Data/Data Table/Filters',
} satisfies Meta<typeof FiltersTable>;

export default meta;

type Canvas = ReturnType<typeof within>;

type Story = StoryObj<typeof meta>;

const paidFilter = { columnFilters: [{ id: 'status', value: ['paid'] }] };

function searchBox(canvas: Canvas) {
  return canvas.getByRole('searchbox', { name: 'Search payments' });
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// The table filters once typing pauses, so each keystroke doesn't refilter
// or announce a result count.
export const SearchWaitsForTyping: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(searchBox(canvas), 'customer2');
    await expect(bodyRows(canvas)).toHaveLength(10);
    await waitFor(() => expect(bodyRows(canvas)).toHaveLength(6));
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('6 results'),
    );
  },
};

// A search on one column filters that column, shows its chip, and clearing
// the field removes the filter.
export const ColumnSearch: Story = {
  args: { searchColumn: 'id' },
  play: async ({ canvas }) => {
    await userEvent.type(searchBox(canvas), 'PAY-02');
    await waitFor(() => expect(bodyRows(canvas)).toHaveLength(6));
    await expect(
      canvas.getByRole('row', { name: /Payment: PAY-02/u }),
    ).toBeVisible();
    await userEvent.clear(searchBox(canvas));
    await waitFor(() =>
      expect(
        canvas.queryByRole('grid', { name: 'Active filters' }),
      ).not.toBeInTheDocument(),
    );
  },
};

// Removing a column's chip clears its filter.
export const RemoveChip: Story = {
  args: { defaultState: paidFilter },
  play: async ({ canvas }) => {
    const chips = canvas.getByRole('grid', { name: 'Active filters' });
    await userEvent.click(
      within(chips).getByRole('button', { name: /Remove/u }),
    );
    await expect(
      canvas.queryByRole('grid', { name: 'Active filters' }),
    ).not.toBeInTheDocument();
    await expect(bodyRows(canvas)).toHaveLength(10);
  },
};

// Delete removes the focused chip.
export const RemoveChipByKeyboard: Story = {
  args: { defaultState: paidFilter },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByText('Status: Paid'));
    await userEvent.keyboard('{Delete}');
    await expect(bodyRows(canvas)).toHaveLength(10);
  },
};

// The chips go with the last one, so focus moves to the search.
export const LastChipFocusesSearch: Story = {
  args: { defaultState: paidFilter },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Remove/u }));
    await expect(searchBox(canvas)).toHaveFocus();
  },
};

// A range filter's chip shows its ends, leaving an open end out; a longer
// list shows every value.
export const RangeChip: Story = {
  args: {
    defaultState: {
      columnFilters: [
        { id: 'amount', value: [undefined, 500] },
        { id: 'id', value: ['PAY-001', 'PAY-002', 'PAY-003'] },
      ],
    },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('row', { name: /Amount: –500/u }),
    ).toBeVisible();
    await expect(
      canvas.getByRole('row', { name: /Payment: PAY-001, PAY-002, PAY-003/u }),
    ).toBeVisible();
  },
};

// Reset clears every filter and the search, and focus moves to the search.
export const ResetFocusesSearch: Story = {
  args: { defaultState: { ...paidFilter, globalFilter: 'customer' } },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(searchBox(canvas)).toHaveFocus();
    await expect(searchBox(canvas)).toHaveValue('');
    await expect(
      canvas.queryByRole('button', { name: 'Reset' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByText('Page 1 of 3', { selector: 'p' }),
    ).toBeVisible();
  },
};

// Reset also drops search text still waiting to apply.
export const ResetDropsPendingSearch: Story = {
  args: { defaultState: paidFilter },
  play: async ({ canvas }) => {
    await userEvent.type(searchBox(canvas), 'customer2');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await wait(300);
    await expect(searchBox(canvas)).toHaveValue('');
    await expect(
      canvas.getByText('Page 1 of 3', { selector: 'p' }),
    ).toBeVisible();
  },
};

// TanStack's own reset clears the search to undefined, which still counts
// as no search.
export const ResetSearchFromApp: Story = {
  args: { defaultState: { globalFilter: 'customer2' } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Reset' })).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'App resets search' }),
    );
    await expect(
      canvas.queryByRole('button', { name: 'Reset' }),
    ).not.toBeInTheDocument();
  },
};

// A filter that matches nothing offers to clear the filters, then focuses the
// search so focus isn't lost with the button.
export const NoResultsClears: Story = {
  args: { defaultState: { globalFilter: 'nobody' } },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear filters' }),
    );
    await expect(bodyRows(canvas)).toHaveLength(10);
    await expect(searchBox(canvas)).toHaveFocus();
  },
};

// A filter on a hidden column keeps its chip, so the hidden rows can be
// explained and cleared.
export const HiddenColumnKeepsChip: Story = {
  args: {
    defaultState: { ...paidFilter, columnVisibility: { status: false } },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('row', { name: /Status: Paid/u }),
    ).toBeVisible();
  },
};

// Search the app controls, such as one in the URL, shows a change made from
// outside.
export const AppSearchSyncs: Story = {
  args: { appSearch: '' },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'App search' }));
    await expect(searchBox(canvas)).toHaveValue('customer1');
    await expect(rowHeaders(canvas)[0]).toBe('PAY-010');
    await expect(
      canvas.getByText('Page 1 of 1', { selector: 'p' }),
    ).toBeVisible();
  },
};

// An app that applies the search late, as a router might, doesn't cut off
// what was typed after the search wrote.
export const LateCommitKeepsTyping: Story = {
  args: { appCommitMs: 250, appSearch: '' },
  play: async ({ canvas }) => {
    await userEvent.type(searchBox(canvas), 'cust');
    await wait(200);
    await userEvent.type(searchBox(canvas), 'omer2');
    await waitFor(() => expect(bodyRows(canvas)).toHaveLength(6), {
      timeout: 2000,
    });
    await expect(searchBox(canvas)).toHaveValue('customer2');
  },
};

// On a phone the search takes the toolbar's width and the rest wraps.
export const Phone: Story = {
  args: { defaultState: paidFilter },
  beforeEach: phoneWidth,
  play: async ({ canvas }) => {
    const toolbar = searchBox(canvas).closest('[data-slot=data-table-toolbar]');
    await expect(toolbar).not.toBeNull();
    const search = canvas
      .getByRole('searchbox')
      .closest('[data-slot=search-field]');
    await expect(search?.getBoundingClientRect().width).toBe(
      toolbar?.getBoundingClientRect().width,
    );
    await expect(document.documentElement.scrollWidth).toBe(
      document.documentElement.clientWidth,
    );
  },
};
