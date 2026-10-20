import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, within } from 'storybook/test';

import { bodyRows, PaymentsTable } from './data-table-demo';

const meta = {
  component: PaymentsTable,
  title: 'Data/Data Table/Selection',
} satisfies Meta<typeof PaymentsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

function rowBox(canvas: ReturnType<typeof within>, id: string) {
  return canvas.getByRole('checkbox', { name: `Select ${id}` });
}

function selectedIds(canvas: ReturnType<typeof within>) {
  return bodyRows(canvas)
    .filter((row) => row.getAttribute('aria-selected') === 'true')
    .map((row) => within(row).getByRole('rowheader').textContent);
}

// A selected row is marked aria-selected, which its tint follows, and the
// action bar's count updates.
export const SelectRow: Story = {
  play: async ({ canvas }) => {
    await expect(bodyRows(canvas)[0]).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(rowBox(canvas, 'PAY-002'));
    await expect(selectedIds(canvas)).toEqual(['PAY-002']);
    await expect(canvas.getByText('1 selected')).toBeVisible();
  },
};

// Shift selects the range from the last row pressed.
export const ShiftSelectsRange: Story = {
  play: async ({ canvas }) => {
    const user = userEvent.setup();
    await user.click(rowBox(canvas, 'PAY-002'));
    await user.keyboard('{Shift>}');
    await user.click(rowBox(canvas, 'PAY-005'));
    await user.keyboard('{/Shift}');
    await expect(selectedIds(canvas)).toEqual([
      'PAY-002',
      'PAY-003',
      'PAY-004',
      'PAY-005',
    ]);
  },
};

// Shift+Space from the keyboard selects a range too.
export const ShiftSpaceSelectsRange: Story = {
  play: async ({ canvas }) => {
    const user = userEvent.setup();
    rowBox(canvas, 'PAY-003').focus();
    await user.keyboard(' ');
    rowBox(canvas, 'PAY-001').focus();
    await user.keyboard('{Shift>} {/Shift}');
    await expect(selectedIds(canvas)).toEqual([
      'PAY-001',
      'PAY-002',
      'PAY-003',
    ]);
  },
};

// A plain press after a range toggles only its own row.
export const PlainPressAfterRange: Story = {
  play: async ({ canvas }) => {
    const user = userEvent.setup();
    await user.click(rowBox(canvas, 'PAY-001'));
    await user.keyboard('{Shift>}');
    await user.click(rowBox(canvas, 'PAY-003'));
    await user.keyboard('{/Shift}');
    await user.click(rowBox(canvas, 'PAY-006'));
    await expect(selectedIds(canvas)).toEqual([
      'PAY-001',
      'PAY-002',
      'PAY-003',
      'PAY-006',
    ]);
    await user.click(rowBox(canvas, 'PAY-003'));
    await expect(selectedIds(canvas)).toEqual([
      'PAY-001',
      'PAY-002',
      'PAY-006',
    ]);
  },
};

// The header box selects the page's rows, not the whole result, and reads
// mixed while only some of them are selected.
export const SelectPage: Story = {
  play: async ({ canvas }) => {
    const all = canvas.getByRole('checkbox', {
      name: 'Select all on this page',
    });
    await userEvent.click(rowBox(canvas, 'PAY-001'));
    await expect(all).toBePartiallyChecked();
    await userEvent.click(all);
    await expect(all).toBeChecked();
    await expect(selectedIds(canvas)).toHaveLength(10);
    await expect(canvas.getByText('10 selected')).toBeVisible();
  },
};

// On the next page the header box reads unchecked, since none of that
// page's rows are selected.
export const PageBoxFollowsThePage: Story = {
  play: async ({ canvas }) => {
    const all = canvas.getByRole('checkbox', {
      name: 'Select all on this page',
    });
    await userEvent.click(all);
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(all).not.toBeChecked();
    await expect(all).not.toBePartiallyChecked();
    await expect(canvas.getByText('10 selected')).toBeVisible();
  },
};

// Selection is kept by payment id, so a sort keeps the same rows selected.
export const SelectionSurvivesSort: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(rowBox(canvas, 'PAY-001'));
    const header = canvas.getByRole('columnheader', { name: /Amount/u });
    await userEvent.click(within(header).getByRole('button'));
    await userEvent.click(within(header).getByRole('button'));
    await expect(canvas.getByText('1 selected')).toBeVisible();
    await expect(rowBox(canvas, 'PAY-006')).not.toBeChecked();
  },
};
