import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@oakoss/ui/components/ui/data/table';
import { expect, waitFor } from 'storybook/test';

import { contrast } from '#/helpers/color';
import { paintedColor } from '#/helpers/paint';
import { hoverReal } from '#/helpers/pointer';

import { cellOf, gradientColor, InvoiceTable } from './table-demo';

const meta = {
  args: { interactive: true, selected: 'INV002' },
  component: InvoiceTable,
  title: 'Data/Table/States',
} satisfies Meta<typeof InvoiceTable>;

export default meta;

type Story = StoryObj<typeof meta>;

// A translucent tint as painted over the page, as an opaque rgb() color.
function onPage(color: string) {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) throw new Error('No canvas');
  for (const fill of [getComputedStyle(document.body).backgroundColor, color]) {
    context.fillStyle = fill;
    context.fillRect(0, 0, 1, 1);
  }
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${red} ${green} ${blue})`;
}

function tint(id: string) {
  return getComputedStyle(cellOf(id, 1)).backgroundImage;
}

function tintColor(id: string) {
  return gradientColor(tint(id));
}

// Hovering a row tints it; rows are plain elements, so the real mouse hovers.
export const Hover: Story = {
  play: async () => {
    const row = cellOf('INV001', 1).parentElement;
    await expect(row?.matches(':hover')).toBe(false);
    const resting = tint('INV001');
    await hoverReal(cellOf('INV001', 1));
    await waitFor(() => expect(row?.matches(':hover')).toBe(true));
    await expect(tint('INV001')).not.toBe(resting);
    await expect(tint('INV001')).not.toBe(tint('INV003'));
  },
};

// A row marked aria-selected takes a primary tint, apart from hover's, and
// hovering it deepens the tint.
export const Selected: Story = {
  play: async () => {
    const selected = tint('INV002');
    await expect(selected).not.toBe(tint('INV001'));
    await hoverReal(cellOf('INV001', 1));
    await waitFor(() =>
      expect(cellOf('INV001', 1).parentElement).toSatisfy((row: Element) =>
        row.matches(':hover'),
      ),
    );
    const hovered = tint('INV001');
    await expect(hovered).not.toBe(selected);
    await hoverReal(cellOf('INV002', 1));
    await waitFor(() => expect(tint('INV002')).not.toBe(selected));
    for (const other of [selected, hovered, tint('INV003')]) {
      await expect(tint('INV002')).not.toBe(other);
    }
  },
};

// Rows that aren't interactive don't tint on hover, and a hovered stripe or
// selected row keeps its tint.
export const NotInteractive: Story = {
  args: { interactive: false, striped: true },
  play: async () => {
    const resting = [tint('INV001'), tint('INV002'), tint('INV004')];
    for (const id of ['INV001', 'INV002', 'INV004']) {
      await hoverReal(cellOf(id, 1));
      await waitFor(() => expect(cellOf(id, 1).matches(':hover')).toBe(true));
    }
    await expect([tint('INV001'), tint('INV002'), tint('INV004')]).toEqual(
      resting,
    );
  },
};

// A table that isn't interactive still tints a selected row, apart from a
// stripe.
export const SelectedNotInteractive: Story = {
  args: { interactive: false, selected: 'INV004', striped: true },
  play: async () => {
    const selected = onPage(tintColor('INV004'));
    const stripe = onPage(tintColor('INV002'));
    await expect(tintColor('INV004')).not.toBe(tintColor('INV001'));
    await expect(contrast(selected, stripe)).toBeGreaterThan(1.04);
  },
};

// Stripe, hover, selected and hovered-selected tints stay apart in both
// themes; dark mode's primary/10 and /15 selection tints fell to 1.026.
export const TintsDistinct: Story = {
  args: { selected: 'INV004', striped: true },
  play: async () => {
    const color = tintColor;
    const stripe = color('INV002');
    const selected = color('INV004');
    await hoverReal(cellOf('INV003', 1));
    await waitFor(() => expect(color('INV003')).not.toBe(color('INV001')));
    const hovered = color('INV003');
    await hoverReal(cellOf('INV004', 1));
    await waitFor(() => expect(color('INV004')).not.toBe(selected));
    const hoveredSelected = color('INV004');
    const tints = [stripe, hovered, selected, hoveredSelected];
    const pairs = tints.flatMap((top, index) =>
      tints.slice(index + 1).map((bottom) => [top, bottom] as const),
    );
    for (const [top, bottom] of pairs) {
      await expect(contrast(onPage(top), onPage(bottom))).toBeGreaterThan(1.04);
    }
  },
};

// Text on a striped or selected row keeps AA contrast over its tint.
export const TintContrast: Story = {
  args: { striped: true },
  play: async () => {
    for (const id of ['INV002', 'INV004']) {
      const cell = cellOf(id, 1);
      const color = gradientColor(getComputedStyle(cell).backgroundImage);
      await expect(color).not.toBe('');
      await expect(
        contrast(getComputedStyle(cell).color, color),
      ).toBeGreaterThan(4.5);
    }
  },
};

// Striped rows tint every other body row; hovering a striped row still
// changes it.
export const Striped: Story = {
  args: { selected: undefined, striped: true },
  play: async () => {
    await expect(tint('INV002')).not.toBe(tint('INV001'));
    await expect(tint('INV004')).toBe(tint('INV002'));
    const stripe = tint('INV002');
    await hoverReal(cellOf('INV002', 1));
    await waitFor(() => expect(tint('INV002')).not.toBe(stripe));
  },
};

// Only body rows stripe: header rows stay plain and footer rows keep the
// footer's tint, even rows included.
export const StripedSections: Story = {
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector('table');
    const image = (row: number) =>
      getComputedStyle(table?.rows[row]?.cells[0] ?? document.body)
        .backgroundImage;
    const plain = image(2);
    await expect(image(3)).not.toBe(plain);
    await expect(image(0)).toBe(plain);
    await expect(image(1)).toBe(plain);
    await expect(image(5)).toBe(image(4));
    await expect(image(4)).not.toBe(plain);
  },
  render: () => (
    <Table aria-label="Sections" striped>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={2} scope="colgroup">
            Invoices
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>INV001</TableCell>
          <TableCell>Paid</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>INV002</TableCell>
          <TableCell>Pending</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Paid</TableCell>
          <TableCell>$250.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Due</TableCell>
          <TableCell>$150.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

// In forced colors tints vanish, so a selected row takes the system's
// selection colors, and rows keep their dividing lines.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const selected = getComputedStyle(cellOf('INV002', 1));
    await expect(selected.backgroundImage).toBe('none');
    await expect(await paintedColor(cellOf('INV002', 1))).not.toBe(
      await paintedColor(cellOf('INV001', 1)),
    );
    await expect(
      contrast(selected.color, selected.backgroundColor),
    ).toBeGreaterThan(4.5);
    await expect(getComputedStyle(cellOf('INV001', 1)).borderBottomWidth).toBe(
      '1px',
    );
  },
  tags: ['forced-colors'],
};
