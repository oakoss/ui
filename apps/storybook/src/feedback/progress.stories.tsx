import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Progress,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from '@oakoss/ui/components/ui/feedback/progress';
import { expect } from 'storybook/test';

import { contrast, tokenColor } from '#/helpers/color';
import { fillRatio, part } from '#/helpers/parts';

const meta = {
  args: { className: 'w-80', label: 'Uploading', value: 40 },
  component: Progress,
  title: 'Feedback/Progress',
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

const intents = [
  'primary',
  'success',
  'warning',
  'destructive',
  'info',
] as const;

// The label prop renders the default layout: a bar named by its label, the
// value formatted for the locale beside it, and a fill as wide as the value.
export const Default: Story = {
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('progressbar', { name: 'Uploading' });
    await expect(bar).toHaveAttribute('aria-valuenow', '40');
    await expect(bar.getBoundingClientRect().width).toBe(320);
    await expect(part('progress-value')).toHaveTextContent('40%');
    await expect(fillRatio('progress')).toBe(0.4);
    const fill = getComputedStyle(part('progress-indicator'));
    await expect(fill.backgroundColor).toBe(tokenColor('--color-primary-text'));
    const track = getComputedStyle(part('progress-track'));
    await expect(track.backgroundColor).toBe(tokenColor('--color-muted'));
    await expect(track.height).toBe('6px');
    await expect(track.overflow).toBe('hidden');
  },
};

// The label and value share a row above the track; the value sits at the
// end, muted, in tabular digits.
export const Layout: Story = {
  play: async () => {
    const label = part('progress-label').getBoundingClientRect();
    const value = part('progress-value').getBoundingClientRect();
    const track = part('progress-track').getBoundingClientRect();
    await expect(value.right).toBe(track.right);
    await expect(value.top).toBe(label.top);
    await expect(track.top).toBeGreaterThan(label.bottom);
    await expect(getComputedStyle(part('progress-label')).fontWeight).toBe(
      '500',
    );
    const style = getComputedStyle(part('progress-value'));
    await expect(style.fontVariantNumeric).toBe('tabular-nums');
    await expect(style.color).toBe(tokenColor('--color-muted-foreground'));
  },
};

// The fill and the value follow the range, not the raw value.
export const Range: Story = {
  args: { maxValue: 200, minValue: 0, value: 50 },
  play: async () => {
    await expect(fillRatio('progress')).toBe(0.25);
    await expect(part('progress-value')).toHaveTextContent('25%');
  },
};

// Without a label nothing mounts above the track; aria-label names the bar.
export const WithoutLabel: Story = {
  args: { 'aria-label': 'Uploading', label: undefined },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('progressbar', { name: 'Uploading' }),
    ).toBeVisible();
    await expect(
      document.querySelector('[data-slot=progress-label]'),
    ).toBeNull();
    await expect(
      document.querySelector('[data-slot=progress-value]'),
    ).toBeNull();
    await expect(part('progress-track')).toBeVisible();
  },
};

// Children replace the layout: here the track comes first, and the value
// adds words around the formatted number.
export const CustomLayout: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('progressbar', { name: 'Uploading' }),
    ).toBeVisible();
    await expect(part('progress-value')).toHaveTextContent('40% done');
    await expect(
      part('progress-track').getBoundingClientRect().bottom,
    ).toBeLessThan(part('progress-label').getBoundingClientRect().top);
    await expect(
      document.querySelectorAll('[data-slot=progress-track]'),
    ).toHaveLength(1);
  },
  render: ({ label: _label, ...args }) => (
    <Progress {...args}>
      <ProgressTrack />
      <ProgressLabel>Uploading</ProgressLabel>
      <ProgressValue>{(text) => `${text} done`}</ProgressValue>
    </Progress>
  ),
};

// A function child gets React Aria's render props.
export const RenderProps: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('40 of 100 sent')).toBeVisible();
    await expect(fillRatio('progress')).toBe(0.4);
  },
  render: ({ label: _label, ...args }) => (
    <Progress {...args} aria-label="Uploading">
      {({ percentage = 0 }) => (
        <>
          <span className="text-sm">{`${Math.round(percentage)} of 100 sent`}</span>
          <ProgressTrack />
        </>
      )}
    </Progress>
  ),
};

// Each intent colors the fill with its text role, which stands 3:1 against
// the track (WCAG 1.4.11) in light and dark.
export const Intents: Story = {
  play: async () => {
    const bars = document.querySelectorAll<HTMLElement>('[data-slot=progress]');
    await expect(bars).toHaveLength(intents.length);
    for (const [index, intent] of intents.entries()) {
      const bar = bars[index];
      if (!bar) throw new Error(`No ${intent} bar`);
      const fill = getComputedStyle(
        part('progress-indicator', bar),
      ).backgroundColor;
      const track = getComputedStyle(
        part('progress-track', bar),
      ).backgroundColor;
      await expect(fill).toBe(tokenColor(`--color-${intent}-text`));
      await expect(contrast(fill, track), intent).toBeGreaterThanOrEqual(3);
    }
  },
  render: (args) => (
    <div className="grid gap-4">
      {intents.map((intent) => (
        <Progress key={intent} {...args} intent={intent} />
      ))}
    </div>
  ),
};

// The fill transitions only its width, so a new value slides rather than
// jumps.
export const ValueChange: Story = {
  play: async () => {
    const style = getComputedStyle(part('progress-indicator'));
    await expect(style.transitionProperty).toBe('width');
    await expect(style.transitionDuration).toBe('0.3s');
  },
};

// Forced colors repaint the track's fill as the page color, so the track
// keeps a border, and the fill takes the system's highlight color.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const track = getComputedStyle(part('progress-track'));
    const fill = getComputedStyle(part('progress-indicator'));
    await expect(track.borderTopWidth).toBe('1px');
    await expect(fill.backgroundColor).not.toBe(track.backgroundColor);
    await expect(fill.backgroundColor).not.toBe(
      getComputedStyle(document.body).backgroundColor,
    );
  },
  tags: ['forced-colors'],
};
