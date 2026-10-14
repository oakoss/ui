import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Meter,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from '@oakoss/ui/components/ui/feedback/meter';
import { expect } from 'storybook/test';

import { contrast, tokenColor } from '#/color';
import { fillRatio, part } from '#/parts';

const meta = {
  args: { className: 'w-80', label: 'Storage', value: 40 },
  component: Meter,
  title: 'Feedback/Meter',
} satisfies Meta<typeof Meter>;

export default meta;

type Story = StoryObj<typeof meta>;

const intents = [
  'primary',
  'success',
  'warning',
  'destructive',
  'info',
] as const;

// The label prop renders the default layout: a meter named by its label, the
// value formatted for the locale beside it, and a fill as wide as the value.
export const Default: Story = {
  play: async ({ canvas }) => {
    const meter = canvas.getByRole('meter', { name: 'Storage' });
    await expect(meter).toHaveAttribute('aria-valuenow', '40');
    await expect(meter.getBoundingClientRect().width).toBe(320);
    await expect(part('meter-value')).toHaveTextContent('40%');
    await expect(fillRatio('meter')).toBe(0.4);
    const fill = getComputedStyle(part('meter-indicator'));
    await expect(fill.backgroundColor).toBe(tokenColor('--color-primary-text'));
    const track = getComputedStyle(part('meter-track'));
    await expect(track.backgroundColor).toBe(tokenColor('--color-muted'));
    await expect(track.height).toBe('6px');
    await expect(track.overflow).toBe('hidden');
  },
};

// The label and value share a row above the track; the value sits at the
// end, muted, in tabular digits.
export const Layout: Story = {
  play: async () => {
    const label = part('meter-label').getBoundingClientRect();
    const value = part('meter-value').getBoundingClientRect();
    const track = part('meter-track').getBoundingClientRect();
    await expect(value.right).toBe(track.right);
    await expect(value.top).toBe(label.top);
    await expect(track.top).toBeGreaterThan(label.bottom);
    await expect(getComputedStyle(part('meter-label')).fontWeight).toBe('500');
    const style = getComputedStyle(part('meter-value'));
    await expect(style.fontVariantNumeric).toBe('tabular-nums');
    await expect(style.color).toBe(tokenColor('--color-muted-foreground'));
  },
};

// The fill follows the range; formatOptions and valueLabel set the text,
// which is also the meter's aria-valuetext.
export const Value: Story = {
  args: {
    formatOptions: { style: 'unit', unit: 'gigabyte' },
    maxValue: 256,
    value: 64,
  },
  play: async ({ canvas }) => {
    await expect(fillRatio('meter')).toBe(0.25);
    await expect(part('meter-value')).toHaveTextContent('64 GB');
    const custom = canvas.getByRole('meter', { name: 'Battery' });
    await expect(custom).toHaveAttribute('aria-valuetext', 'About 2 hours');
    await expect(custom).toHaveTextContent('About 2 hours');
  },
  render: (args) => (
    <div className="grid gap-4">
      <Meter {...args} />
      <Meter
        className="w-80"
        label="Battery"
        value={30}
        valueLabel="About 2 hours"
      />
    </div>
  ),
};

// Without a label nothing mounts above the track; aria-label names the meter.
export const WithoutLabel: Story = {
  args: { 'aria-label': 'Storage', label: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('meter', { name: 'Storage' })).toBeVisible();
    await expect(document.querySelector('[data-slot=meter-label]')).toBeNull();
    await expect(document.querySelector('[data-slot=meter-value]')).toBeNull();
    await expect(part('meter-track')).toBeVisible();
  },
};

// Children replace the layout: here the track comes first, and the value
// adds words around the formatted number.
export const CustomLayout: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('meter', { name: 'Storage' })).toBeVisible();
    await expect(part('meter-value')).toHaveTextContent('40% used');
    await expect(
      part('meter-track').getBoundingClientRect().bottom,
    ).toBeLessThan(part('meter-label').getBoundingClientRect().top);
    await expect(
      document.querySelectorAll('[data-slot=meter-track]'),
    ).toHaveLength(1);
  },
  render: ({ label: _label, ...args }) => (
    <Meter {...args}>
      <MeterTrack />
      <MeterLabel>Storage</MeterLabel>
      <MeterValue>{(text) => `${text} used`}</MeterValue>
    </Meter>
  ),
};

// Each part takes className and its element's props; Meter's className can be
// a function of the render props. A value that formats to nothing mounts
// nothing.
export const Parts: Story = {
  play: async ({ canvas }) => {
    const meter = canvas.getByRole('meter', { name: 'Storage' });
    await expect(meter.getBoundingClientRect().width).toBe(288);
    await expect(getComputedStyle(part('meter-label')).fontWeight).toBe('400');
    await expect(part('meter-track').getBoundingClientRect().height).toBe(8);
    await expect(part('meter-track')).toHaveAttribute('id', 'storage-track');
    const value = part('meter-value');
    await expect(value).toHaveAttribute('id', 'storage-value');
    await expect(getComputedStyle(value).fontSize).toBe('12px');
    await expect(
      document.querySelectorAll('[data-slot=meter-value]'),
    ).toHaveLength(1);
  },
  render: ({ className: _className, label: _label, ...args }) => (
    <Meter
      {...args}
      className={({ percentage }) => (percentage >= 40 ? 'w-72' : 'w-80')}
    >
      <MeterLabel className="font-normal">Storage</MeterLabel>
      <MeterValue className="text-xs" id="storage-value" />
      <MeterValue>{() => ''}</MeterValue>
      <MeterTrack className="h-2" id="storage-track" />
    </Meter>
  ),
};

// A function child gets React Aria's render props.
export const RenderProps: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('40 of 100 seats')).toBeVisible();
    await expect(fillRatio('meter')).toBe(0.4);
  },
  render: ({ label: _label, ...args }) => (
    <Meter {...args} aria-label="Seats">
      {({ percentage }) => (
        <>
          <span className="text-sm">{`${Math.round(percentage)} of 100 seats`}</span>
          <MeterTrack />
        </>
      )}
    </Meter>
  ),
};

// Each intent colors the fill with its text role, which stands 3:1 against
// the track (WCAG 1.4.11) in light and dark.
export const Intents: Story = {
  play: async () => {
    const meters = document.querySelectorAll<HTMLElement>('[data-slot=meter]');
    await expect(meters).toHaveLength(intents.length);
    for (const [index, intent] of intents.entries()) {
      const meter = meters[index];
      if (!meter) throw new Error(`No ${intent} meter`);
      const fill = getComputedStyle(
        part('meter-indicator', meter),
      ).backgroundColor;
      const track = getComputedStyle(
        part('meter-track', meter),
      ).backgroundColor;
      await expect(fill).toBe(tokenColor(`--color-${intent}-text`));
      await expect(contrast(fill, track), intent).toBeGreaterThanOrEqual(3);
    }
  },
  render: (args) => (
    <div className="grid gap-4">
      {intents.map((intent) => (
        <Meter key={intent} {...args} intent={intent} />
      ))}
    </div>
  ),
};

// In a right-to-left locale the fill grows from the track's right end, and
// the value sits at the row's left end.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    fillRatio('meter');
    const track = part('meter-track').getBoundingClientRect();
    const fill = part('meter-indicator').getBoundingClientRect();
    await expect(fill.right).toBe(track.right);
    await expect(fill.left).toBeGreaterThan(track.left);
    await expect(part('meter-value').getBoundingClientRect().left).toBe(
      track.left,
    );
  },
};

// The fill transitions only its width, so a new value slides rather than
// jumps.
export const ValueChange: Story = {
  play: async () => {
    const style = getComputedStyle(part('meter-indicator'));
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
    const track = getComputedStyle(part('meter-track'));
    const fill = getComputedStyle(part('meter-indicator'));
    await expect(track.borderTopWidth).toBe('1px');
    await expect(fill.backgroundColor).not.toBe(track.backgroundColor);
    await expect(fill.backgroundColor).not.toBe(
      getComputedStyle(document.body).backgroundColor,
    );
  },
  tags: ['forced-colors'],
};
