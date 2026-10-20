import type { Meta, StoryObj } from '@storybook/react-vite';

import { linkColumn } from '@oakoss/ui/components/ui/data/data-table-columns';
import { RouterProvider } from 'react-aria-components';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { clickReal } from '#/helpers/pointer';

import {
  bodyRows,
  type Payment,
  paymentColumns,
  payments,
  PaymentsTable,
  rowHeaders,
} from './data-table-demo';

const navigate = fn<(path: string) => void>();

const meta = {
  component: PaymentsTable,
  title: 'Data/Data Table/Columns',
} satisfies Meta<typeof PaymentsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

function columnHeaders(canvas: ReturnType<typeof within>) {
  return canvas
    .getAllByRole('columnheader')
    .map((header: HTMLElement) => header.textContent);
}

// The menu lists the data columns, not selection or actions, and stays open
// so several can change at once.
export const HideColumns: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Columns' }));
    const menu = await screen.findByRole('menu');
    const items = within(menu).getAllByRole('menuitemcheckbox');
    await expect(items.map((item) => item.textContent)).toEqual([
      'Status',
      'Email',
      'Created',
      'Amount',
    ]);
    await userEvent.click(
      within(menu).getByRole('menuitemcheckbox', { name: 'Email' }),
    );
    await userEvent.click(
      within(menu).getByRole('menuitemcheckbox', { name: 'Created' }),
    );
    await expect(menu).toBeVisible();
    await expect(columnHeaders(canvas)).not.toContain('Email');
    await expect(columnHeaders(canvas)).not.toContain('Created');
    await expect(
      within(menu).getByRole('menuitemcheckbox', { name: 'Email' }),
    ).toHaveAttribute('aria-checked', 'false');
  },
};

// Numbers, currency and dates follow the app's locale.
export const LocaleFormats: Story = {
  globals: { locale: 'de-DE' },
  play: async ({ canvas }) => {
    const [row] = bodyRows(canvas);
    const cells = within(row ?? document.body).getAllByRole('cell');
    const texts = cells.map((cell: HTMLElement) => cell.textContent);
    // German puts a non-breaking space before the currency sign.
    await expect(texts).toContain('100,00\u{A0}$');
    await expect(texts).toContain('10.01.2026');
  },
};

// A bare day keeps its day in every time zone, rather than shifting to the
// day before west of UTC.
export const BareDay: Story = {
  args: {
    data: payments.map((payment) => ({ ...payment, createdAt: '2026-03-01' })),
  },
  play: async ({ canvas }) => {
    const [row] = bodyRows(canvas);
    const time = within(row ?? document.body).getByText('Mar 1, 2026');
    await expect(time).toHaveAttribute('datetime', '2026-03-01');
  },
};

// Decimal columns that arrive as strings format as numbers; an empty string
// stays empty rather than reading as zero.
export const NumericStrings: Story = {
  args: {
    data: payments.map((payment, index) => ({
      ...payment,
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- an API that sends decimals as strings
      amount: (index === 0 ? '12.50' : '') as unknown as number,
    })),
  },
  play: async ({ canvas }) => {
    const [first, second] = bodyRows(canvas);
    await expect(
      within(first ?? document.body).getByText('$12.50'),
    ).toBeVisible();
    await expect(second).not.toHaveTextContent('$');
  },
};

// Presets sort by the value they show: amounts sent as strings by number,
// dates by instant whatever their offset.
export const SortsShownValues: Story = {
  args: {
    data: [
      ['-3', '2025-12-31T20:00:00-05:00'],
      ['-20', '2026-01-01T00:00:00Z'],
      ['5', '2025-06-01T00:00:00Z'],
      ['', 'not a date'],
    ].map(([amount, createdAt], index) => ({
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- an API that sends decimals as strings
      amount: amount as unknown as number,
      createdAt: createdAt ?? '',
      email: `customer0${String(index + 1)}@example.com`,
      id: `PAY-00${String(index + 1)}`,
      status: 'paid' as const,
    })),
  },
  play: async ({ canvas }) => {
    const header = (name: string) =>
      within(
        canvas.getByRole('columnheader', { name: new RegExp(name, 'u') }),
      ).getByRole('button');
    // An unreadable value sorts first.
    await userEvent.click(header('Amount'));
    await expect(rowHeaders(canvas)).toEqual([
      'PAY-004',
      'PAY-002',
      'PAY-001',
      'PAY-003',
    ]);
    await userEvent.click(header('Created'));
    await expect(rowHeaders(canvas)).toEqual([
      'PAY-004',
      'PAY-003',
      'PAY-002',
      'PAY-001',
    ]);
  },
};

// Amounts align to the end of their column, under their header.
export const NumbersAlignEnd: Story = {
  play: async ({ canvas }) => {
    const header = canvas.getByRole('columnheader', { name: /Amount/u });
    const [row] = bodyRows(canvas);
    const amount = within(row ?? document.body).getByText('$100.00');
    await expect(getComputedStyle(header).textAlign).toBe('end');
    await expect(getComputedStyle(amount).textAlign).toBe('end');
  },
};

// The actions column has a name for screen readers but no visible header.
export const ActionsHeader: Story = {
  play: async ({ canvas }) => {
    const header = canvas.getByRole('columnheader', { name: 'Actions' });
    await expect(within(header).getByText('Actions')).toHaveClass('sr-only');
  },
};

const linkedColumns = [
  ...paymentColumns.slice(0, 1),
  linkColumn<Payment>('id', {
    header: 'Payment',
    href: (row) => `/payments/${row.original.id}`,
  }),
  ...paymentColumns.slice(2),
];

// A link in each row's header cell stretches over the row, so a click
// anywhere opens it, while the row's own controls keep their clicks.
export const RowLink: Story = {
  args: { columns: linkedColumns },
  decorators: [
    (Story) => (
      <RouterProvider navigate={navigate}>
        <Story />
      </RouterProvider>
    ),
  ],
  play: async ({ canvas }) => {
    navigate.mockClear();
    const [row] = bodyRows(canvas);
    const cells = within(row ?? document.body);
    await expect(cells.getByRole('rowheader')).toContainElement(
      cells.getByRole('link', { name: 'PAY-001' }),
    );
    await clickReal(cells.getByText('customer01@example.com'));
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith('/payments/PAY-001', undefined),
    );
    navigate.mockClear();
    await userEvent.click(cells.getByRole('checkbox'));
    await expect(cells.getByRole('checkbox')).toBeChecked();
    await expect(navigate).not.toHaveBeenCalled();
  },
};
