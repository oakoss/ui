import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, screen, userEvent, type within } from 'storybook/test';

import { phoneWidth } from '#/helpers/viewport';

import {
  bodyRows,
  pageLabel,
  PaymentsTable,
  rowHeaders,
} from './data-table-demo';

const meta = {
  component: PaymentsTable,
  title: 'Data/Data Table/Pagination',
} satisfies Meta<typeof PaymentsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

function step(canvas: ReturnType<typeof within>, name: string) {
  return canvas.getByRole('button', { name });
}

// Page buttons step through the result and disable at its ends.
export const Steps: Story = {
  play: async ({ canvas }) => {
    await expect(step(canvas, 'First page')).toBeDisabled();
    await expect(step(canvas, 'Previous page')).toBeDisabled();
    await userEvent.click(step(canvas, 'Next page'));
    await expect(rowHeaders(canvas)[0]).toBe('PAY-011');
    await userEvent.click(step(canvas, 'Last page'));
    await expect(pageLabel(canvas)).toHaveTextContent('Page 3 of 3');
    await expect(bodyRows(canvas)).toHaveLength(5);
    await expect(step(canvas, 'Next page')).toBeDisabled();
    await expect(step(canvas, 'Last page')).toBeDisabled();
    await userEvent.click(step(canvas, 'First page'));
    await expect(rowHeaders(canvas)[0]).toBe('PAY-001');
  },
};

// A larger page keeps the reader's top row on screen.
export const PageSize: Story = {
  args: { defaultState: { pagination: { pageIndex: 1, pageSize: 10 } } },
  play: async ({ canvas }) => {
    const size = canvas.getByRole('button', { name: /Rows per page/u });
    await expect(size).toHaveTextContent('10');
    await userEvent.click(size);
    await userEvent.click(await screen.findByRole('option', { name: '20' }));
    await expect(size).toHaveTextContent('20');
    await expect(bodyRows(canvas)).toHaveLength(20);
    await expect(rowHeaders(canvas)).toContain('PAY-011');
    await expect(pageLabel(canvas)).toHaveTextContent('Page 1 of 2');
  },
};

// Arrows point the reading direction's way.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const icon = step(canvas, 'Next page').querySelector('svg');
    await expect(getComputedStyle(icon ?? document.body).rotate).toBe('180deg');
  },
};

// On a phone the bar wraps and drops first and last, keeping one step each way.
export const Phone: Story = {
  beforeEach: phoneWidth,
  play: async ({ canvas }) => {
    const names = canvas
      .getAllByRole('button')
      .map((button: HTMLElement) => button.getAttribute('aria-label'));
    await expect(names).not.toContain('First page');
    await expect(names).not.toContain('Last page');
    await expect(step(canvas, 'Next page')).toBeVisible();
    await expect(step(canvas, 'Previous page')).toBeVisible();
  },
};
