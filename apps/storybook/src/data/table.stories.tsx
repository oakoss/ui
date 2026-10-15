import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@oakoss/ui/components/ui/data/table';
import { expect } from 'storybook/test';

import { part } from '#/helpers/parts';

import { cellOf, InvoiceTable } from './table-demo';

const meta = { component: InvoiceTable, title: 'Data/Table' } satisfies Meta<
  typeof InvoiceTable
>;

export default meta;

type Story = StoryObj<typeof meta>;

function height(table: HTMLTableElement | undefined, index: number) {
  return table?.rows[index]?.getBoundingClientRect().height;
}

// A native table named by its caption; header cells head their column, and a
// header cell in the body heads its row.
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table')).toHaveAccessibleName(
      'Recent invoices',
    );
    await expect(
      canvas.getByRole('columnheader', { name: 'Status' }),
    ).toHaveAttribute('scope', 'col');
    await expect(
      canvas.getByRole('rowheader', { name: 'INV002' }),
    ).toHaveAttribute('scope', 'row');
    await expect(
      canvas.getByRole('rowheader', { name: 'Total' }),
    ).toHaveAttribute('scope', 'row');
  },
};

// A table that fits doesn't scroll, so it's no tab stop or landmark.
export const FitsWithoutScrolling: Story = {
  play: async () => {
    const container = part('table-container');
    await expect(container).not.toHaveAttribute('tabindex');
    await expect(container).not.toHaveAttribute('role');
  },
};

// Numbers align to the end with digits of equal width, so columns line up;
// the end follows the reading direction.
export const AlignEnd: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    const amount = cellOf('INV001', 3);
    const style = getComputedStyle(amount);
    await expect(style.textAlign).toBe('end');
    await expect(style.fontVariantNumeric).toBe('tabular-nums');
    await expect(getComputedStyle(cellOf('INV001', 0)).fontVariantNumeric).toBe(
      'tabular-nums',
    );
    const text = document.createRange();
    text.selectNodeContents(amount);
    const box = amount.getBoundingClientRect();
    const padding = Number(style.paddingInlineEnd.replace('px', ''));
    await expect(text.getBoundingClientRect().left).toBeCloseTo(
      box.left + padding,
      0,
    );
  },
};

// A scope the consumer sets wins over the section's default.
export const ExplicitScope: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('columnheader', { name: 'Total' }),
    ).toHaveAttribute('scope', 'colgroup');
  },
  render: () => (
    <Table aria-label="Totals">
      <TableHeader>
        <TableRow>
          <TableHead scope="colgroup">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>$1,200.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// Compact rows suit dense data.
export const Sizes: Story = {
  play: async ({ canvasElement }) => {
    const [md, sm] = canvasElement.querySelectorAll('table');
    await expect(height(md, 0)).toBe(40);
    await expect(height(sm, 0)).toBe(32);
    await expect(height(md, 1)).toBe(37);
    await expect(height(sm, 1)).toBe(29);
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <InvoiceTable caption="Default size" />
      <InvoiceTable caption="Compact" size="sm" />
    </div>
  ),
};

// No rows: one cell spans every column with a message.
export const Empty: Story = {
  play: async ({ canvas }) => {
    const cell = canvas.getByRole('cell', { name: 'No invoices yet.' });
    await expect(cell.getBoundingClientRect().width).toBe(
      part('table').getBoundingClientRect().width,
    );
  },
  render: () => (
    <Table aria-label="Invoices">
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell
            align="center"
            className="h-24 text-muted-foreground"
            colSpan={3}
          >
            No invoices yet.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// Table cells ignore max-width, so a span inside truncates; the cell keeps
// its full text for screen readers, and a title shows it on hover.
export const Truncated: Story = {
  play: async ({ canvas }) => {
    const note = 'Paid in two installments after the first reminder';
    const cell = canvas.getByRole('cell', { name: note });
    const text = cell.firstElementChild;
    await expect(text).toHaveAttribute('title', note);
    await expect(text?.scrollWidth).toBeGreaterThan(text?.clientWidth ?? 0);
  },
  render: () => (
    <Table aria-label="Notes">
      <TableBody>
        <TableRow>
          <TableHead>INV001</TableHead>
          <TableCell>
            <span
              className="block max-w-40 truncate"
              title="Paid in two installments after the first reminder"
            >
              Paid in two installments after the first reminder
            </span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
