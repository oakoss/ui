import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  type IconResolver,
  IconResolverContext,
} from '@oakoss/ui/components/icon-placeholder';
import { Spinner } from '@oakoss/ui/components/ui/feedback/spinner';
import { Button } from 'react-aria-components';
import { expect } from 'storybook/test';

const meta = { component: Spinner, title: 'Feedback/Spinner' } satisfies Meta<
  typeof Spinner
>;

export default meta;

type Story = StoryObj<typeof meta>;

function icon() {
  const element = document.querySelector('[data-slot=spinner] svg');
  if (!(element instanceof SVGElement)) throw new Error('No icon');
  return element;
}

function spinner() {
  const element = document.querySelector('[data-slot=spinner]');
  if (!(element instanceof HTMLElement)) throw new Error('No spinner');
  return element;
}

// An indeterminate progress bar named "Loading", with a spinning icon.
export const Default: Story = {
  play: async ({ canvas }) => {
    const element = canvas.getByRole('progressbar', { name: 'Loading' });
    await expect(element).not.toHaveAttribute('aria-valuenow');
    await expect(element).toHaveAttribute('data-size', 'md');
    await expect(getComputedStyle(icon()).animationName).toBe('spin');
    await expect(icon().getBoundingClientRect().width).toBe(16);
  },
};

export const Label: Story = {
  args: { label: 'Saving changes' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('progressbar', { name: 'Saving changes' }),
    ).toBeVisible();
  },
};

// An empty label falls back to "Loading" rather than leaving it unnamed.
export const EmptyLabel: Story = {
  args: { label: '' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('progressbar', { name: 'Loading' }),
    ).toBeVisible();
  },
};

// The spinner hides its icon itself, even from an icon library that doesn't.
const bareIcon: IconResolver = (_names, props) => (
  <svg viewBox="0 0 24 24" {...props} />
);

export const HiddenIcon: Story = {
  play: async ({ canvas }) => {
    await expect(icon()).toHaveAttribute('aria-hidden', 'true');
    await expect(
      canvas.getByRole('progressbar', { name: 'Loading' }),
    ).toBeVisible();
  },
  render: (args) => (
    <IconResolverContext value={bareIcon}>
      <Spinner {...args} />
    </IconResolverContext>
  ),
};

export const Sizes: Story = {
  play: async ({ canvas }) => {
    const spinners = canvas.getAllByRole('progressbar');
    await expect(spinners.map((element) => element.dataset.size)).toEqual([
      'sm',
      'md',
      'lg',
    ]);
    await expect(
      spinners.map(
        (element) =>
          element.querySelector('svg')?.getBoundingClientRect().width,
      ),
    ).toEqual([12, 16, 24]);
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner label="Small" size="sm" />
      <Spinner label="Medium" size="md" />
      <Spinner label="Large" size="lg" />
    </div>
  ),
};

// A span, so it stays inside a paragraph or a button, in line with the text.
export const Inline: Story = {
  play: async ({ canvas }) => {
    const paragraph = canvas.getByText(/Saving/u);
    await expect(paragraph.tagName).toBe('P');
    await expect(paragraph).toContainElement(spinner());
    await expect(spinner().getBoundingClientRect().width).toBe(16);
    await expect(canvas.getByRole('button')).toContainElement(
      canvas.getByRole('progressbar', { name: 'Uploading' }),
    );
  },
  render: () => (
    <div className="flex flex-col items-start gap-4 text-sm">
      <p>
        Saving <Spinner /> your changes
      </p>
      <Button className="inline-flex items-center gap-2">
        <Spinner label="Uploading" />
        Upload
      </Button>
    </div>
  ),
};

// The spinner takes its color from the text around it.
export const CurrentColor: Story = {
  play: async ({ canvasElement }) => {
    const wrapper = canvasElement.querySelector('.text-primary');
    if (!wrapper) throw new Error('No wrapper');
    await expect(getComputedStyle(icon()).color).toBe(
      getComputedStyle(wrapper).color,
    );
  },
  render: () => (
    <div className="text-primary">
      <Spinner />
    </div>
  ),
};

// A consumer's class wins over the base class it conflicts with.
export const ClassName: Story = {
  args: { className: 'flex text-destructive' },
  play: async () => {
    const style = getComputedStyle(spinner());
    await expect(style.display).toBe('flex');
    await expect(getComputedStyle(icon()).color).toBe(style.color);
    await expect(style.color).not.toBe(getComputedStyle(document.body).color);
  },
};
