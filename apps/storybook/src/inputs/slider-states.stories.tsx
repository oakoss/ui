import type { Meta, StoryObj } from '@storybook/react-vite';

import { Slider } from '@oakoss/ui/components/ui/inputs/slider';
import { expect, userEvent } from 'storybook/test';

import { contrast } from '../color';
import { part } from '../parts';

// Storybook reads props from a component, not a generic one.
const SingleSlider = Slider<number>;

const meta = {
  args: { className: 'w-80', defaultValue: 40, label: 'Volume' },
  component: SingleSlider,
  title: 'Inputs/Slider/States',
} satisfies Meta<typeof SingleSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

function center(box: DOMRect) {
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

function page() {
  return getComputedStyle(document.body).backgroundColor;
}

function rect(slot: string) {
  return part(slot).getBoundingClientRect();
}

function thumbs() {
  return [...document.querySelectorAll('[data-slot=slider-thumb]')].map(
    (thumb) => thumb.getBoundingClientRect(),
  );
}

// The rail's line and the fill both meet 3:1 against the page, so the slider
// reads as a control and its value shows.
export const Rail: Story = {
  play: async () => {
    const line = part('slider-rail').firstElementChild;
    if (!line) throw new Error('No rail line');
    const fill = getComputedStyle(part('slider-range')).backgroundColor;
    await expect(
      contrast(getComputedStyle(line).borderTopColor, page()),
    ).toBeGreaterThan(3);
    await expect(contrast(fill, page())).toBeGreaterThan(3);
  },
};

// The thumb sits on the fill's end, centered on the rail, label or not.
export const Thumb: Story = {
  play: async () => {
    const [thumb] = thumbs();
    if (!thumb) throw new Error('No thumb');
    const fill = rect('slider-range');
    await expect(center(thumb).x).toBeCloseTo(fill.right, 0);
    await expect(center(thumb).y).toBeCloseTo(center(rect('slider-rail')).y, 0);
  },
};

// At either end the thumb stays inside the slider's box.
export const Ends: Story = {
  play: async () => {
    const slider = rect('slider');
    const [start, end] = thumbs();
    if (!start || !end) throw new Error('No thumbs');
    await expect(start.left).toBeCloseTo(slider.left, 0);
    await expect(end.right).toBeCloseTo(slider.right, 0);
  },
  render: () => (
    <Slider
      className="w-80"
      defaultValue={[0, 100]}
      label="Price"
      thumbLabels={['Minimum', 'Maximum']}
    />
  ),
};

// Right to left, the fill grows from the right and the thumb follows it.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    const [thumb] = thumbs();
    if (!thumb) throw new Error('No thumb');
    const fill = rect('slider-range');
    await expect(fill.right).toBeCloseTo(rect('slider-rail').right, 0);
    await expect(center(thumb).x).toBeCloseTo(fill.left, 0);
  },
};

// Vertical, the slider takes the consumer's height and the track fills it;
// the fill grows from the bottom and the thumb is centered on the rail in
// either direction.
export const Vertical: Story = {
  args: { className: 'h-60', orientation: 'vertical' },
  play: async () => {
    const [thumb] = thumbs();
    if (!thumb) throw new Error('No thumb');
    const slider = rect('slider');
    const rail = rect('slider-rail');
    const fill = rect('slider-range');
    await expect(slider.height).toBe(240);
    await expect(rect('slider-track').bottom).toBeCloseTo(slider.bottom - 8, 0);
    await expect(fill.bottom).toBeCloseTo(rail.bottom, 0);
    await expect(center(thumb).y).toBeCloseTo(fill.top, 0);
    await expect(center(thumb).x).toBeCloseTo(center(rail).x, 0);
    await expect(rect('slider-track').width).toBe(44);
  },
};

export const VerticalRightToLeft: Story = {
  ...Vertical,
  globals: { locale: 'ar-EG' },
};

// Vertical, the thumbs at either end stay inside the slider's box too.
export const VerticalEnds: Story = {
  play: async () => {
    const slider = rect('slider');
    const [bottom, top] = thumbs();
    if (!bottom || !top) throw new Error('No thumbs');
    await expect(top.top).toBeGreaterThanOrEqual(rect('field-label').bottom);
    await expect(bottom.bottom).toBeCloseTo(slider.bottom, 0);
  },
  render: () => (
    <Slider
      className="h-60"
      defaultValue={[0, 100]}
      label="Price"
      orientation="vertical"
      thumbLabels={['Minimum', 'Maximum']}
    />
  ),
};

export const FocusRing: Story = {
  play: async () => {
    await userEvent.tab();
    await expect(getComputedStyle(part('slider-thumb')).outlineStyle).toBe(
      'solid',
    );
  },
};

// Forced colors keep the rail, the fill and the thumb visible, and disabled
// takes the system's disabled color. Highlight can sit close to the text color
// (Chrome's emulation measured 1.1:1), so the rail thins to an outline and the
// solid fill stands out by shape.
export const ForcedColors: Story = {
  // In High Contrast the user's system colors set contrast, and axe's rule
  // misreads the forced colors.
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const line = part('slider-rail').firstElementChild;
    if (!line) throw new Error('No rail line');
    const rail = getComputedStyle(line).borderTopColor;
    const fill = getComputedStyle(part('slider-range')).backgroundColor;
    await expect(contrast(rail, page())).toBeGreaterThan(3);
    await expect(contrast(fill, page())).toBeGreaterThan(3);
    await expect(getComputedStyle(line).borderTopWidth).toBe('1px');
    const thumb = getComputedStyle(part('slider-thumb')).borderTopColor;
    await expect(contrast(thumb, page())).toBeGreaterThan(3);
  },
  tags: ['forced-colors'],
};

export const ForcedColorsDisabled: Story = {
  args: { isDisabled: true },
  parameters: ForcedColors.parameters,
  play: async () => {
    const line = part('slider-rail').firstElementChild;
    if (!line) throw new Error('No rail line');
    const gray = getComputedStyle(line).borderTopColor;
    await expect(getComputedStyle(part('slider-range')).backgroundColor).toBe(
      gray,
    );
    await expect(getComputedStyle(part('slider-thumb')).borderTopColor).toBe(
      gray,
    );
    await expect(contrast(gray, page())).toBeGreaterThan(1.5);
  },
  tags: ['forced-colors'],
};
