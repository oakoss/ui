import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  FieldDescription,
  FieldLabel,
} from '@oakoss/ui/components/ui/inputs/field';
import {
  Slider,
  SliderOutput,
  SliderTrack,
} from '@oakoss/ui/components/ui/inputs/slider';
import { expect, fn, userEvent } from 'storybook/test';

import { part } from '../parts';

const onChange = fn<(value: number) => void>();

// Storybook reads props from a component, not a generic one.
const SingleSlider = Slider<number>;

const meta = {
  args: { className: 'w-80', defaultValue: 40, label: 'Volume', onChange },
  beforeEach: () => {
    onChange.mockClear();
  },
  component: SingleSlider,
  title: 'Inputs/Slider',
} satisfies Meta<typeof SingleSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

// The label names the thumb and the output shows its value; arrow keys step
// it.
export const Default: Story = {
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole('slider', { name: 'Volume' });
    await expect(part('slider-output')).toHaveTextContent('40');
    await userEvent.click(canvas.getByText('Volume'));
    await expect(thumb).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(thumb).toHaveValue('41');
    await expect(part('slider-output')).toHaveTextContent('41');
    await expect(onChange).toHaveBeenLastCalledWith(41);
  },
};

// The output formats the value for the locale.
export const Formatted: Story = {
  args: {
    defaultValue: 0.4,
    formatOptions: { style: 'percent' },
    maxValue: 1,
    step: 0.01,
  },
  play: async ({ canvas }) => {
    await expect(part('slider-output')).toHaveTextContent('40%');
    await expect(canvas.getByRole('slider')).toHaveAttribute(
      'aria-valuetext',
      '40%',
    );
  },
};

// Each thumb of a range is named by the label and its own thumb label, and
// the output shows the range.
export const Range: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('slider', { name: 'Minimum Price' }),
    ).toHaveValue('20');
    await expect(
      canvas.getByRole('slider', { name: 'Maximum Price' }),
    ).toHaveValue('80');
    await expect(part('slider-output').textContent).toMatch(
      /^\$20\.00\s–\s\$80\.00$/u,
    );
  },
  render: () => (
    <Slider
      className="w-80"
      defaultValue={[20, 80]}
      formatOptions={{ currency: 'USD', style: 'currency' }}
      label="Price"
      thumbLabels={['Minimum', 'Maximum']}
    />
  ),
};

// Children replace the layout; the parts still wire up.
export const Composed: Story = {
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole('slider', { name: 'Minimum Price' });
    await expect(thumb).toHaveAccessibleDescription('Before tax.');
    await expect(part('slider-output')).toHaveTextContent('20');
  },
  render: () => (
    <Slider
      className="w-80"
      defaultValue={[20, 80]}
      thumbLabels={['Minimum', 'Maximum']}
    >
      <div className="flex items-center justify-between gap-2">
        <FieldLabel>Price</FieldLabel>
        <SliderOutput />
      </div>
      <SliderTrack />
      <FieldDescription>Before tax.</FieldDescription>
    </Slider>
  ),
};

// Children that render nothing fall back to the layout, so a track remains.
export const EmptyChildren: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('slider', { name: 'Volume' })).toBeVisible();
  },
  render: () => (
    <Slider aria-label="Volume" className="w-80" defaultValue={40}>
      {''}
    </Slider>
  ),
};

// Named by aria-label alone, the slider shows only its track, and an enabled
// group isn't marked disabled.
export const NoVisibleLabel: Story = {
  args: { 'aria-label': 'Volume', label: undefined },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('slider', { name: 'Volume' })).toBeVisible();
    await expect(
      canvasElement.querySelector('[data-slot=slider-output]'),
    ).toBeNull();
    await expect(canvas.getByRole('group')).not.toHaveAttribute(
      'aria-disabled',
    );
  },
};

// The track takes presses 20px off the rail, inside its 44px band, and moves
// the thumb to the point pressed.
export const PressTrack: Story = {
  play: async ({ canvas }) => {
    const rail = part('slider-rail').getBoundingClientRect();
    const x = rail.left + rail.width * 0.75;
    for (const y of [
      rail.top + rail.height / 2 - 20,
      rail.top + rail.height / 2 + 20,
    ]) {
      // userEvent skips hit-testing, so find what a real press would reach.
      const target = document.elementFromPoint(x, y);
      await expect(part('slider-track').contains(target)).toBe(true);
    }
    const y = rail.top + rail.height / 2 - 20;
    await userEvent.pointer({
      coords: { clientX: x, clientY: y },
      keys: '[MouseLeft]',
      target: part('slider-track'),
    });
    await expect(canvas.getByRole('slider')).toHaveValue('75');
  },
};

// The group is marked disabled too, so axe treats the faded label and value
// as inactive text, which WCAG exempts from its contrast minimum.
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('slider')).toBeDisabled();
    await expect(canvas.getByRole('group')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    // Each part fades once; nested fades would compound.
    for (const slot of ['field-label', 'slider-output', 'slider-track']) {
      await expect(getComputedStyle(part(slot)).opacity).toBe('0.5');
    }
    await expect(getComputedStyle(part('slider')).opacity).toBe('1');
  },
};
