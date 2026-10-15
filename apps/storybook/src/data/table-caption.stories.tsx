import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from '@oakoss/ui/components/ui/data/table';
import { type ReactNode, useEffect, useState } from 'react';
import { expect, waitFor } from 'storybook/test';

import { part } from '#/helpers/parts';

const meta = { title: 'Data/Table/Caption' } satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// Lets a play function change the caption after mount.
const controls = {
  setIsLoading: undefined as ((isLoading: boolean) => void) | undefined,
  setText: undefined as ((text: string) => void) | undefined,
};

function SwappedCaption() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    controls.setIsLoading = setIsLoading;
  }, []);
  return (
    <WideTable
      caption={
        <>
          {isLoading && <TableCaption>Loading invoices</TableCaption>}
          {!isLoading && <TableCaption>Invoices</TableCaption>}
        </>
      }
    />
  );
}

function WideTable({ caption }: { caption: ReactNode }) {
  return (
    <Table containerClassName="w-72">
      {caption}
      <TableBody>
        <TableRow>
          <TableCell>
            A cell wide enough to make the table scroll sideways in its space
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

// One caption replacing another in the same render names the region.
export const Swapped: Story = {
  play: async ({ canvas }) => {
    await canvas.findByRole('region', { name: 'Loading invoices' });
    controls.setIsLoading?.(false);
    await expect(await canvas.findByRole('region', { name: 'Invoices' })).toBe(
      part('table-container'),
    );
  },
  render: () => <SwappedCaption />,
};

function LateText() {
  const [text, setText] = useState('');
  useEffect(() => {
    controls.setText = setText;
  }, []);
  return text;
}

// Text a caption's child renders later, without the caption rendering again,
// names the region once it appears.
export const TextAfterMount: Story = {
  play: async ({ canvas }) => {
    const container = part('table-container');
    await waitFor(() => expect(container).toHaveAttribute('tabindex', '0'));
    await expect(container).not.toHaveAttribute('role');
    controls.setText?.('Invoices');
    await expect(await canvas.findByRole('region', { name: 'Invoices' })).toBe(
      container,
    );
  },
  render: () => (
    <WideTable
      caption={
        <TableCaption>
          <LateText />
        </TableCaption>
      }
    />
  ),
};
