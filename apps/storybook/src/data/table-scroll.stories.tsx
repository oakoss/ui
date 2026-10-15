import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, waitFor } from 'storybook/test';

import { tokenColor } from '#/helpers/color';
import { part } from '#/helpers/parts';

import { cellOf, InvoiceTable } from './table-demo';

const meta = {
  args: { containerClassName: 'w-72' },
  component: InvoiceTable,
  title: 'Data/Table/Scroll',
} satisfies Meta<typeof InvoiceTable>;

export default meta;

type Story = StoryObj<typeof meta>;

function cue(element: Element, pseudo: '::after' | '::before') {
  return Number(getComputedStyle(element, pseudo).opacity);
}

async function scrollTo(options: ScrollToOptions) {
  const container = part('table-container');
  container.scrollTo(options);
  await waitFor(() =>
    expect(container).toSatisfy(
      (element: HTMLElement) =>
        Math.abs(element.scrollLeft) > 0 || element.scrollTop > 0,
    ),
  );
}

// A table wider than its space scrolls, so it becomes a tab stop and a region
// named by its caption.
export const Overflowing: Story = {
  play: async ({ canvas }) => {
    const region = await canvas.findByRole('region', {
      name: 'Recent invoices',
    });
    await expect(region).toHaveAttribute('tabindex', '0');
    await expect(region).toBe(part('table-container'));
  },
};

// The table's own label names the region over its caption.
export const LabelledRegion: Story = {
  args: { 'aria-label': 'Invoices this month' },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole('region', { name: 'Invoices this month' }),
    ).toBe(part('table-container'));
  },
};

// Without a name it stays focusable to scroll, but isn't a landmark.
export const UnnamedRegion: Story = {
  args: { caption: '' },
  play: async () => {
    const container = part('table-container');
    await waitFor(() => expect(container).toHaveAttribute('tabindex', '0'));
    await expect(container).not.toHaveAttribute('role');
  },
};

// Growing past its space makes the table a tab stop without a remount.
export const BecomesScrollable: Story = {
  args: { containerClassName: 'w-[60rem]' },
  play: async () => {
    const container = part('table-container');
    await expect(container).not.toHaveAttribute('tabindex');
    container.style.width = '18rem';
    await waitFor(() => expect(container).toHaveAttribute('tabindex', '0'));
  },
};

// The header stays at the top while rows scroll under it, with a shadow
// below it once they have.
export const StickyHeader: Story = {
  args: { containerClassName: 'h-48', rows: 12, stickyHeader: true },
  play: async ({ canvas }) => {
    const header = canvas.getByRole('columnheader', { name: 'Status' });
    const top = part('table-container').getBoundingClientRect().top;
    await expect(cue(header, '::after')).toBe(0);
    await scrollTo({ top: 120 });
    await expect(header.getBoundingClientRect().top).toBe(top);
    await waitFor(() => expect(cue(header, '::after')).toBe(1));
  },
};

// The first column stays put while the rest scrolls under it, with a shadow
// at its edge once they have.
export const StickyColumn: Story = {
  args: { stickyColumn: true },
  play: async () => {
    const first = cellOf('INV001', 0);
    const start = first.getBoundingClientRect().left;
    await expect(cue(first, '::before')).toBe(0);
    await scrollTo({ left: 120 });
    await expect(first.getBoundingClientRect().left).toBe(start);
    await expect(cellOf('INV001', 1).getBoundingClientRect().left).toBeLessThan(
      start + first.getBoundingClientRect().width,
    );
    await waitFor(() => expect(cue(first, '::before')).toBe(1));
  },
};

// Right to left, the first column sticks to the right edge.
export const StickyColumnRTL: Story = {
  args: { stickyColumn: true },
  globals: { locale: 'ar-EG' },
  play: async () => {
    const first = cellOf('INV001', 0);
    const end = first.getBoundingClientRect().right;
    await expect(end).toBe(
      part('table-container').getBoundingClientRect().right,
    );
    await scrollTo({ left: -120 });
    await expect(first.getBoundingClientRect().right).toBe(end);
    await waitFor(() => expect(cue(first, '::before')).toBe(1));
  },
};

// Sticky cells paint --table-bg, so content can't show through them.
export const OnASurface: Story = {
  args: { stickyColumn: true },
  // Set once on the surface, so every table inside it matches.
  play: async () => {
    const surface = part('table-container').parentElement;
    surface?.style.setProperty('--table-bg', 'var(--color-muted)');
    const first = getComputedStyle(cellOf('INV001', 0)).backgroundColor;
    await expect(first).toBe(tokenColor('--color-muted'));
    await expect(first).not.toBe(tokenColor('--color-background'));
  },
  render: (args) => (
    <div className="rounded-lg bg-muted p-4">
      <InvoiceTable {...args} />
    </div>
  ),
};

// Without a surface set, sticky cells paint the page color.
export const DefaultSurface: Story = {
  args: { stickyColumn: true },
  play: async () => {
    await expect(getComputedStyle(cellOf('INV001', 0)).backgroundColor).toBe(
      tokenColor('--color-background'),
    );
  },
};
