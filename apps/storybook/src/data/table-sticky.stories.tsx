import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@oakoss/ui/components/ui/data/table';
import { expect, waitFor } from 'storybook/test';

import { tokenColor } from '#/helpers/color';
import { part } from '#/helpers/parts';
import { hoverReal } from '#/helpers/pointer';

import { cellOf, InvoiceTable } from './table-demo';

const meta = {
  args: {
    containerClassName: 'w-72 h-48',
    rows: 12,
    stickyColumn: true,
    stickyHeader: true,
  },
  component: InvoiceTable,
  title: 'Data/Table/Sticky',
} satisfies Meta<typeof InvoiceTable>;

export default meta;

type Story = StoryObj<typeof meta>;

function centerOf(element: Element) {
  const box = element.getBoundingClientRect();
  return document.elementFromPoint(
    box.left + box.width / 2,
    box.top + box.height / 2,
  );
}

function cue(element: Element, pseudo: '::after' | '::before') {
  return Number(getComputedStyle(element, pseudo).opacity);
}

function scrollTo(options: ScrollToOptions) {
  part('table-container').scrollTo(options);
}

function tint(id: string, column: number) {
  return getComputedStyle(cellOf(id, column)).backgroundImage;
}

// With both sticky, the corner header stays over the column and the header
// row, and body row headers scroll up under the header.
export const Both: Story = {
  play: async ({ canvas }) => {
    const container = part('table-container');
    const corner = canvas.getByRole('columnheader', { name: 'Invoice' });
    const status = canvas.getByRole('columnheader', { name: 'Status' });
    scrollTo({ left: 120, top: 120 });
    await waitFor(() => expect(cue(status, '::after')).toBe(1));
    await expect(centerOf(corner)).toBe(corner);
    await expect(getComputedStyle(status).backgroundColor).toBe(
      tokenColor('--color-background'),
    );
    await expect(cellOf('INV001', 0).getBoundingClientRect().top).toBeLessThan(
      container.getBoundingClientRect().top,
    );
  },
};

// Scrolling back to the start hides both edge shadows again.
export const ScrolledBack: Story = {
  play: async ({ canvas }) => {
    const status = canvas.getByRole('columnheader', { name: 'Status' });
    const first = cellOf('INV001', 0);
    scrollTo({ left: 120, top: 120 });
    await waitFor(() => expect(cue(first, '::before')).toBe(1));
    await waitFor(() => expect(cue(status, '::after')).toBe(1));
    scrollTo({ left: 0, top: 0 });
    await waitFor(() => expect(cue(first, '::before')).toBe(0));
    await waitFor(() => expect(cue(status, '::after')).toBe(0));
  },
};

// A sticky cell keeps its row's tint: selected, striped and hovered.
export const StickyCellTint: Story = {
  args: { selected: 'INV002', striped: true },
  play: async () => {
    scrollTo({ left: 120 });
    await waitFor(() => expect(cue(cellOf('INV001', 0), '::before')).toBe(1));
    await expect(tint('INV002', 0)).toBe(tint('INV002', 1));
    await expect(tint('INV004', 0)).toBe(tint('INV004', 1));
    await expect(tint('INV002', 0)).not.toBe(tint('INV001', 0));
    await expect(tint('INV004', 0)).not.toBe(tint('INV001', 0));
    await hoverReal(cellOf('INV003', 1));
    await waitFor(() => expect(tint('INV003', 0)).not.toBe(tint('INV001', 0)));
    await expect(tint('INV003', 0)).toBe(tint('INV003', 1));
  },
};

// A first cell spanning several columns doesn't stick, so it never covers
// the cells it spans past.
export const SpanningFirstCell: Story = {
  args: { containerClassName: 'w-48', rows: 2, stickyHeader: false },
  play: async ({ canvas }) => {
    const total = canvas.getByRole('rowheader', { name: 'Total' });
    const amount = canvas.getByRole('cell', { name: '$1,200.00' });
    await expect(getComputedStyle(total).position).not.toBe('sticky');
    scrollTo({ left: 1000 });
    await waitFor(() => expect(centerOf(amount)).toBe(amount));
  },
};

// The header sticks as a whole, so its rows keep their order when scrolled.
export const MultiRowHeader: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole('columnheader', { name: 'Payment' });
    const status = canvas.getByRole('columnheader', { name: 'Status' });
    const container = part('table-container');
    scrollTo({ top: 120 });
    await waitFor(() => expect(cue(status, '::after')).toBe(1));
    await expect(group.getBoundingClientRect().top).toBe(
      container.getBoundingClientRect().top,
    );
    await expect(status.getBoundingClientRect().top).toBe(
      group.getBoundingClientRect().bottom,
    );
  },
  render: () => <PaymentsTable />,
};

// Below a first cell spanning rows, the next row's first cell sits in the
// second column, so it opts out of sticking rather than cover the corner.
export const RowSpanningCorner: Story = {
  play: async ({ canvas }) => {
    const corner = canvas.getByRole('columnheader', { name: 'Invoice' });
    const status = canvas.getByRole('columnheader', { name: 'Status' });
    await expect(getComputedStyle(status).position).not.toBe('sticky');
    scrollTo({ left: 200 });
    await waitFor(() => expect(cue(cellOf('INV001', 0), '::before')).toBe(1));
    await expect(centerOf(corner)).toBe(corner);
  },
  render: () => <PaymentsTable containerClassName="h-40 w-48" />,
};

function PaymentsTable({ containerClassName = 'h-40' }) {
  return (
    <Table
      aria-label="Payments"
      containerClassName={containerClassName}
      stickyColumn
      stickyHeader
    >
      <TableHeader>
        <TableRow>
          <TableHead rowSpan={2}>Invoice</TableHead>
          <TableHead colSpan={2} scope="colgroup">
            Payment
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead isSticky={false}>Status</TableHead>
          <TableHead>Method</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 12 }, (_, index) => (
          <TableRow key={index}>
            <TableHead>{`INV${String(index + 1).padStart(3, '0')}`}</TableHead>
            <TableCell>Paid</TableCell>
            <TableCell>Credit card</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// The edge shadow sits on the side the content scrolls in from.
export const ShadowDirection: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    const image = getComputedStyle(cellOf('INV001', 0), '::before');
    await expect(image.backgroundImage).toContain('to left');
  },
};

// A nested table's shadows follow its own scrolling, not the outer table's.
export const Nested: Story = {
  play: async ({ canvasElement }) => {
    const [outer, inner] = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot=table-container]',
    );
    const innerFirst = inner?.querySelector('td');
    const outerFirst = outer?.querySelector(':scope tbody td');
    outer?.scrollTo({ left: 200 });
    await waitFor(() =>
      expect(cue(outerFirst ?? document.body, '::before')).toBe(1),
    );
    await expect(cue(innerFirst ?? document.body, '::before')).toBe(0);
  },
  render: () => (
    <Table aria-label="Outer" containerClassName="w-72" stickyColumn>
      <TableBody>
        <TableRow>
          <TableCell>Summary</TableCell>
          <TableCell>
            <Table aria-label="Inner" containerClassName="w-48" stickyColumn>
              <TableBody>
                <TableRow>
                  <TableCell>Inner first</TableCell>
                  <TableCell>Inner second cell</TableCell>
                  <TableCell>Inner third cell</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableCell>
          <TableCell>
            A wide trailing cell that overflows the outer table
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// In forced colors the shadow is gone, so a border marks the column's edge.
export const ForcedColorsEdge: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const style = getComputedStyle(cellOf('INV001', 0));
    await expect(style.borderInlineEndWidth).not.toBe('0px');
    await expect(
      getComputedStyle(cellOf('INV001', 1)).borderInlineEndWidth,
    ).toBe('0px');
  },
  tags: ['forced-colors'],
};
