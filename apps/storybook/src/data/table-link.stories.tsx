import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@oakoss/ui/components/ui/data/table';
import { expect, waitFor } from 'storybook/test';

import { computedColor, contrast, tokenColor } from '#/helpers/color';
import { paintedColor } from '#/helpers/paint';
import { part } from '#/helpers/parts';

import { cellOf, gradientColor, InvoiceTable } from './table-demo';

const meta = {
  args: { interactive: true, rows: 12, selected: 'INV002', striped: true },
  component: InvoiceTable,
  title: 'Data/Table/Link',
} satisfies Meta<typeof InvoiceTable>;

export default meta;

type Story = StoryObj<typeof meta>;

function mark(id: string, column?: number) {
  const row = cellOf(id, 0).parentElement;
  const target = column === undefined ? row : cellOf(id, column);
  target?.setAttribute('aria-current', 'true');
}

function tint(id: string, column = 1) {
  return getComputedStyle(cellOf(id, column)).backgroundImage;
}

// A linked row (aria-current) takes a warm tint over selection and stripes,
// with its text still readable.
export const LinkedRow: Story = {
  play: async () => {
    const plain = tint('INV001');
    const selected = tint('INV002');
    for (const id of ['INV005', 'INV002', 'INV004']) mark(id);
    await waitFor(() => expect(tint('INV005')).not.toBe(plain));
    await expect(tint('INV002')).toBe(tint('INV005'));
    await expect(tint('INV004')).toBe(tint('INV005'));
    await expect(tint('INV002')).not.toBe(selected);
    const cell = getComputedStyle(cellOf('INV005', 1));
    const color = gradientColor(cell.backgroundImage);
    await expect(color).not.toBe('');
    await expect(contrast(cell.color, color)).toBeGreaterThan(4.5);
  },
};

// aria-current="false" isn't a link.
export const NotCurrent: Story = {
  play: async () => {
    const plain = tint('INV001');
    cellOf('INV001', 0).parentElement?.setAttribute('aria-current', 'false');
    await expect(tint('INV001')).toBe(plain);
  },
};

// A linked cell takes the tint without its row, over a plain, selected or
// striped row alike.
export const LinkedCell: Story = {
  play: async () => {
    const plain = tint('INV005', 2);
    for (const id of ['INV005', 'INV002', 'INV004']) mark(id, 2);
    await waitFor(() => expect(tint('INV005', 2)).not.toBe(plain));
    await expect(tint('INV002', 2)).toBe(tint('INV005', 2));
    await expect(tint('INV004', 2)).toBe(tint('INV005', 2));
    await expect(tint('INV005', 1)).toBe(plain);
  },
};

// A cell focused for a link draws the focus ring, not the browser's outline.
export const FocusedCell: Story = {
  play: async () => {
    const head = cellOf('INV005', 0);
    head.tabIndex = -1;
    head.focus({ preventScroll: true });
    await waitFor(() => expect(head).toHaveFocus());
    const style = getComputedStyle(head);
    await expect(head.matches(':focus-visible')).toBe(true);
    await expect(style.outlineStyle).toBe('solid');
    await expect(style.outlineColor).toBe(tokenColor('--color-ring'));
  },
};

// A linked row scrolled into view lands below the sticky header.
export const ScrollsBelowStickyHeader: Story = {
  args: { containerClassName: 'h-48 w-72', stickyHeader: true },
  play: async () => {
    const container = part('table-container');
    const header = container.querySelector('thead');
    const target = cellOf('INV010', 1);
    target.scrollIntoView({ block: 'start' });
    await waitFor(() => expect(container.scrollTop).toBeGreaterThan(0));
    await expect(target.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      (header?.getBoundingClientRect().bottom ?? 0) - 1,
    );
  },
};

// A linked cell scrolled into view lands past the sticky column.
export const ScrollsPastStickyColumn: Story = {
  args: { containerClassName: 'h-48 w-56', stickyColumn: true },
  play: async () => {
    const container = part('table-container');
    const target = cellOf('INV003', 2);
    container.scrollTo({ left: 1000 });
    await waitFor(() => expect(container.scrollLeft).toBeGreaterThan(0));
    target.scrollIntoView({ block: 'nearest', inline: 'start' });
    await expect(target.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      cellOf('INV003', 0).getBoundingClientRect().right - 1,
    );
  },
};

// A first body cell that doesn't stick, such as one spanning columns, doesn't
// stop the rows below from padding scrolling by their sticky first cell.
export const PadsPastNonStickyFirstCell: Story = {
  play: async () => {
    const container = part('table-container');
    const sticky = cellOf('INV001', 0);
    await waitFor(() =>
      expect(
        Number(
          getComputedStyle(container).scrollPaddingInlineStart.replace(
            'px',
            '',
          ),
        ),
      ).toBeCloseTo(sticky.getBoundingClientRect().width, 1),
    );
  },
  render: () => (
    <Table aria-label="Grouped" containerClassName="w-56" stickyColumn>
      <TableBody>
        <TableRow>
          <TableHead colSpan={3} scope="colgroup">
            January
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead>INV001</TableHead>
          <TableCell>Paid</TableCell>
          <TableCell>Credit card ending in 4242</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// Without sticky parts there's nothing to clear.
export const NoStickyPadding: Story = {
  args: { containerClassName: 'h-48 w-72' },
  play: async () => {
    const style = getComputedStyle(part('table-container'));
    await expect(style.scrollPaddingTop).toBe('auto');
    await expect(style.scrollPaddingInlineStart).toBe('auto');
  },
};

// In forced colors a linked row takes the system's Mark colors, apart from a
// selected row's Highlight.
export const ForcedColorsLinked: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const selected = await paintedColor(cellOf('INV002', 1));
    mark('INV005');
    const linked = cellOf('INV005', 1);
    await waitFor(() =>
      expect(getComputedStyle(linked).backgroundImage).toBe('none'),
    );
    const linkedPaint = await paintedColor(linked);
    await expect(linkedPaint).not.toBe(selected);
    await expect(linkedPaint).not.toBe(await paintedColor(cellOf('INV001', 1)));
    await expect(getComputedStyle(linked).color).toBe(
      computedColor('MarkText'),
    );
    mark('INV002');
    await expect(await paintedColor(cellOf('INV002', 1))).toBe(linkedPaint);
    await expect(getComputedStyle(cellOf('INV002', 1)).color).toBe(
      computedColor('MarkText'),
    );
  },
  tags: ['forced-colors'],
};

// In forced colors a linked cell takes Mark too.
export const ForcedColorsLinkedCell: Story = {
  parameters: ForcedColorsLinked.parameters,
  play: async () => {
    const plain = await paintedColor(cellOf('INV006', 2));
    mark('INV006', 2);
    mark('INV002', 2);
    const linked = cellOf('INV006', 2);
    await waitFor(() =>
      expect(getComputedStyle(linked).backgroundImage).toBe('none'),
    );
    const linkedPaint = await paintedColor(linked);
    await expect(linkedPaint).not.toBe(plain);
    await expect(getComputedStyle(linked).color).toBe(
      computedColor('MarkText'),
    );
    await expect(await paintedColor(cellOf('INV002', 2))).toBe(linkedPaint);
  },
  tags: ['forced-colors'],
};
