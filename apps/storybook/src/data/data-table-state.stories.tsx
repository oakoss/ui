import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PaginationState } from '@tanstack/react-table';

import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { bodyRows, pageLabel } from './data-table-demo';
import { StateTable } from './data-table-state-demo';

const meta = {
  component: StateTable,
  title: 'Data/Data Table/State',
} satisfies Meta<typeof StateTable>;

export default meta;

type Story = StoryObj<typeof meta>;

const secondPage = { pagination: { pageIndex: 1, pageSize: 10 } };
const lastPage = { pagination: { pageIndex: 2, pageSize: 10 } };

// Rows removed from under the last page step the table back to a page that
// has rows, rather than showing an empty one.
export const RowsRemovedFromLastPage: Story = {
  args: { defaultState: lastPage },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Remove 10' }));
    await waitFor(() =>
      expect(pageLabel(canvas)).toHaveTextContent('Page 2 of 2'),
    );
    await expect(bodyRows(canvas)).toHaveLength(5);
  },
};

// A table opened on a later page keeps it while its rows load.
export const PageWaitsForRows: Story = {
  args: { defaultState: lastPage, isEmptyAtFirst: true },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Load' }));
    await expect(pageLabel(canvas)).toHaveTextContent('Page 3 of 3');
    await expect(bodyRows(canvas)[0]).toHaveAttribute('aria-rowindex', '22');
  },
};

// With no rows the pager and announcer say page 1 of 1, and nothing pages
// away from the page kept for when rows return.
export const NoPagesToStep: Story = {
  args: { defaultState: lastPage },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(pageLabel(canvas)).toHaveTextContent('Page 1 of 1');
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Page 1 of 1'),
    );
    await expect(
      canvas.getByRole('button', { name: 'Previous page' }),
    ).toBeDisabled();
  },
};

// A link that arrives before its rows shows the row once they load.
export const LinkedRowWaitsForRows: Story = {
  args: { isEmptyAtFirst: true, linkedRowId: 'PAY-023' },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Load' }));
    await waitFor(() =>
      expect(pageLabel(canvas)).toHaveTextContent('Page 3 of 3'),
    );
    await waitFor(() =>
      expect(canvas.getByRole('rowheader', { name: 'PAY-023' })).toHaveFocus(),
    );
  },
};

// An app that applies page changes a tick later hears one request to step
// back, not a loop of them.
export const AppPaginationPastTheEnd: Story = {
  args: {
    appPagination: { pageIndex: 5, pageSize: 10 },
    onPaginationChange: fn<(pagination: PaginationState) => void>(),
  },
  play: async ({ args, canvas }) => {
    await waitFor(() =>
      expect(pageLabel(canvas)).toHaveTextContent('Page 3 of 3'),
    );
    await expect(args.onPaginationChange).toHaveBeenCalledOnce();
    await expect(args.onPaginationChange).toHaveBeenCalledWith({
      pageIndex: 2,
      pageSize: 10,
    });
  },
};

// A page the app moved to, outside the table's handlers, still resets on a
// new filter.
export const AppMovedPageThenFilter: Story = {
  args: { appPagination: { pageIndex: 0, pageSize: 10 } },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'App to page 3' }),
    );
    await waitFor(() =>
      expect(pageLabel(canvas)).toHaveTextContent('Page 3 of 3'),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Search' }));
    await waitFor(() =>
      expect(pageLabel(canvas)).toHaveTextContent('Page 1 of 3'),
    );
  },
};

// A larger page size and a link in one change move the page once, to the
// link's page, never by way of the page the old size left past the end.
export const ResizeAndLinkTogether: Story = {
  args: {
    appPagination: { pageIndex: 2, pageSize: 10 },
    onPaginationChange: fn<(pagination: PaginationState) => void>(),
  },
  play: async ({ args, canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'App resizes and links' }),
    );
    await waitFor(() =>
      expect(pageLabel(canvas)).toHaveTextContent('Page 1 of 2'),
    );
    await expect(args.onPaginationChange).not.toHaveBeenCalledWith({
      pageIndex: 1,
      pageSize: 20,
    });
  },
};

// A negative page with a link goes straight to the link's page, never by way
// of page 1.
export const NegativePageWithLink: Story = {
  args: {
    appPagination: { pageIndex: -1, pageSize: 10 },
    linkedRowId: 'PAY-015',
    onPaginationChange: fn<(pagination: PaginationState) => void>(),
  },
  play: async ({ args, canvas }) => {
    await waitFor(() =>
      expect(pageLabel(canvas)).toHaveTextContent('Page 2 of 3'),
    );
    await expect(args.onPaginationChange).not.toHaveBeenCalledWith({
      pageIndex: 0,
      pageSize: 10,
    });
  },
};

// The first-page reset builds on what a sort handler changed, so a page size
// it sets survives.
export const SortHandlerSetsPageSize: Story = {
  args: { defaultState: lastPage, resizesOnSort: true },
  play: async ({ canvas }) => {
    const header = canvas.getByRole('columnheader', { name: /Amount/u });
    await userEvent.click(within(header).getByRole('button'));
    await expect(pageLabel(canvas)).toHaveTextContent('Page 1 of 1');
    await expect(bodyRows(canvas)).toHaveLength(25);
  },
};

// A new filter shows its first page.
export const FilterShowsFirstPage: Story = {
  args: { defaultState: secondPage },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Search' }));
    await expect(pageLabel(canvas)).toHaveTextContent('Page 1 of 3');
  },
};

// A number column filters by range without naming a filter function, and
// shows its first page.
export const NumberRangeFilter: Story = {
  args: { defaultState: secondPage },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Amounts/u }));
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('16 results'),
    );
    // 16 amounts fall in the range, two pages' worth.
    await expect(pageLabel(canvas)).toHaveTextContent('Page 1 of 2');
    const amounts = bodyRows(canvas).map((row) =>
      Number(
        row.lastElementChild?.previousElementSibling?.textContent.replaceAll(
          /[$,]/gu,
          '',
        ),
      ),
    );
    await expect(amounts.length).toBeGreaterThan(0);
    await expect(
      amounts.every((amount) => amount >= 200 && amount <= 800),
    ).toBe(true);
  },
};

// Two changes in one event both land.
export const TwoChangesInOneEvent: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Select two' }));
    await expect(canvas.getByText('2 of 25 selected')).toBeVisible();
  },
};

// A controlled slice wins over the table's own, even when the app turns a
// change down.
export const ControlledPage: Story = {
  args: { state: secondPage },
  play: async ({ canvas }) => {
    await expect(pageLabel(canvas)).toHaveTextContent('Page 2 of 3');
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(pageLabel(canvas)).toHaveTextContent('Page 2 of 3');
  },
};
