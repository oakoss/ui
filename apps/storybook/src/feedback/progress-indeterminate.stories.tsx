import type { Meta, StoryObj } from '@storybook/react-vite';

import { Progress } from '@oakoss/ui/components/ui/feedback/progress';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import { withReducedMotion } from '#/motion';
import { part } from '#/parts';

const meta = {
  args: { className: 'w-80', isIndeterminate: true, label: 'Uploading' },
  component: Progress,
  title: 'Feedback/Progress/Indeterminate',
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

// Without a value the bar has no aria-valuenow and shows no value, and a
// short fill keeps sliding across the track from the start of the line to
// past its end.
export const Default: Story = {
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('progressbar', { name: 'Uploading' });
    await expect(bar).not.toHaveAttribute('aria-valuenow');
    await expect(
      document.querySelector('[data-slot=progress-value]'),
    ).toBeNull();
    const fill = part('progress-indicator');
    const track = part('progress-track').getBoundingClientRect();
    await expect(fill.getBoundingClientRect().width / track.width).toBe(0.4);
    const [animation] = fill.getAnimations();
    if (!animation) throw new Error('No animation');
    await expect(animation.playState).toBe('running');
    await expect(animation.effect?.getComputedTiming().iterations).toBe(
      Infinity,
    );
    const { end, start } = slide(fill);
    await expect(start.right).toBe(track.left);
    await expect(end.left).toBeCloseTo(track.right, 0);
  },
};

// In a right-to-left locale the fill slides from the right.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    const track = part('progress-track').getBoundingClientRect();
    const { end, start } = slide(part('progress-indicator'));
    await expect(start.left).toBe(track.right);
    await expect(end.right).toBeCloseTo(track.left, 0);
  },
};

// With reduced motion the fill doesn't slide: it rests as a short bar in the
// middle of the track, which doesn't read as a value.
export const ReducedMotion: Story = {
  play: async () => {
    await withReducedMotion(async () => {
      await expect(matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(
        true,
      );
      const indicator = part('progress-indicator');
      await Promise.all(indicator.getAnimations().map((a) => a.finished));
      const fill = indicator.getBoundingClientRect();
      const track = part('progress-track').getBoundingClientRect();
      await expect(fill.left - track.left).toBeCloseTo(
        track.right - fill.right,
      );
      await expect(fill.width).toBeLessThan(track.width);
    });
    await expect(matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(
      false,
    );
  },
};

// A button outside the bar reports a value while the story runs.
function Switching() {
  const [value, setValue] = useState<number | undefined>();
  return (
    <div className="grid w-80 justify-items-start gap-3">
      <Progress
        className="w-80"
        isIndeterminate={value === undefined}
        label="Uploading"
        value={value}
      />
      <Button onPress={() => setValue(10)} variant="outline">
        Report progress
      </Button>
    </div>
  );
}

// When a value arrives the fill starts at it, rather than shrinking from the
// indeterminate bar's width, which would look like progress going backwards.
export const ToDeterminate: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Report progress' }),
    );
    await waitFor(() =>
      expect(part('progress-value')).toHaveTextContent('10%'),
    );
    const fill = part('progress-indicator');
    await expect(
      fill
        .getAnimations()
        .filter((animation) => animation.playState === 'running'),
    ).toHaveLength(0);
    await expect(
      fill.getBoundingClientRect().width /
        part('progress-track').getBoundingClientRect().width,
    ).toBeCloseTo(0.1);
  },
  render: () => <Switching />,
};

// The fill's box at the first and last frames of its slide.
function slide(fill: HTMLElement) {
  const [animation] = fill.getAnimations();
  if (!animation) throw new Error('No animation');
  const duration = Number(animation.effect?.getComputedTiming().duration);
  animation.pause();
  animation.currentTime = 0;
  const start = fill.getBoundingClientRect();
  animation.currentTime = duration - 0.001;
  const end = fill.getBoundingClientRect();
  return { end, start };
}
