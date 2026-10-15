import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from '@oakoss/ui/components/ui/data/table';
import { createRef, useEffect, useState } from 'react';
import { expect, waitFor } from 'storybook/test';

import { part } from '#/helpers/parts';

import { InvoiceTable } from './table-demo';

const meta = {
  args: { containerClassName: 'w-72' },
  component: InvoiceTable,
  title: 'Data/Table/Region',
} satisfies Meta<typeof InvoiceTable>;

export default meta;

type Story = StoryObj<typeof meta>;

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

// aria-labelledby names the region over aria-label and the caption.
export const LabelledbyWins: Story = {
  args: { 'aria-label': 'Ignored label', 'aria-labelledby': 'heading' },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole('region', { name: 'Invoices this month' }),
    ).toBe(part('table-container'));
  },
  render: (args) => (
    <>
      <h2 id="heading">Invoices this month</h2>
      <InvoiceTable {...args} />
    </>
  ),
};

// A blank label isn't a name, so the caption names the region.
export const BlankLabel: Story = {
  args: { 'aria-label': ' ' },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole('region', { name: 'Recent invoices' }),
    ).toBe(part('table-container'));
  },
};

// A blank caption names nothing, so the table scrolls without a region.
export const BlankCaption: Story = {
  args: { caption: ' ' },
  play: async () => {
    const container = part('table-container');
    await waitFor(() => expect(container).toHaveAttribute('tabindex', '0'));
    await expect(container).not.toHaveAttribute('role');
    await expect(container).not.toHaveAttribute('aria-labelledby');
  },
};

// A caption whose children render no text names nothing either.
export const EmptyCaptionChildren: Story = {
  play: BlankCaption.play,
  render: () => (
    <Table containerClassName="w-72">
      <TableCaption>
        <>{null}</>
        {false}
      </TableCaption>
      <TableBody>
        <TableRow>
          <TableCell>
            A cell wide enough to make the table scroll sideways in its space
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// Lets a play function change the table's content after mount.
const controls = {
  setIsShown: undefined as ((isShown: boolean) => void) | undefined,
  setNote: undefined as ((note: string) => void) | undefined,
};

function CaptionToggle() {
  const [isShown, setIsShown] = useState(true);
  useEffect(() => {
    controls.setIsShown = setIsShown;
  }, []);
  return (
    <InvoiceTable
      caption={isShown ? 'Recent invoices' : ''}
      containerClassName="w-72"
    />
  );
}

// Removing the caption after mount takes the region's name and role with it.
export const CaptionRemoved: Story = {
  play: async ({ canvas }) => {
    await canvas.findByRole('region', { name: 'Recent invoices' });
    controls.setIsShown?.(false);
    const container = part('table-container');
    await waitFor(() => expect(container).not.toHaveAttribute('role'));
    await expect(container).not.toHaveAttribute('aria-labelledby');
    await expect(container).toHaveAttribute('tabindex', '0');
  },
  render: () => <CaptionToggle />,
};

const tableRef = createRef<HTMLTableElement>();

function GrowingTable() {
  const [note, setNote] = useState('Paid');
  useEffect(() => {
    controls.setNote = setNote;
  }, []);
  return (
    <Table
      aria-label="Notes"
      containerClassName="h-24 w-72 scrollbar-none"
      ref={tableRef}
    >
      <TableCaption>Notes</TableCaption>
      <TableBody>
        <TableRow>
          <TableCell>{note}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

// A consumer's ref reaches the table, and the container still notices the
// table growing past it without resizing itself.
export const RefAndGrowth: Story = {
  play: async () => {
    await expect(tableRef.current).toBe(part('table'));
    const container = part('table-container');
    await expect(container).not.toHaveAttribute('tabindex');
    // Hidden scrollbars keep the container's size when the table overflows,
    // so only the table's own resize can notice it.
    await expect(getComputedStyle(container).scrollbarWidth).toBe('none');
    await nextFrame();
    await nextFrame();
    controls.setNote?.(
      'Paid in two installments after the first and second reminders',
    );
    await waitFor(() => expect(container).toHaveAttribute('tabindex', '0'));
  },
  render: () => <GrowingTable />,
};
