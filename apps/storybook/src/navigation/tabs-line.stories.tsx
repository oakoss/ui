import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@oakoss/ui/components/ui/navigation/tabs';
import { expect, userEvent, waitFor } from 'storybook/test';

import { flatBackground } from '#/helpers/color';
import { withReducedMotion } from '#/helpers/motion';

const meta = {
  args: { variant: 'line' },
  component: Tabs,
  // Labels of different widths, so a slide resizes the line as it moves.
  render: (args) => (
    <Tabs {...args} className="w-120">
      <TabsList aria-label="Account">
        <TabsTrigger id="profile">Profile</TabsTrigger>
        <TabsTrigger id="billing">Billing and invoices</TabsTrigger>
        <TabsTrigger id="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent id="profile">Your name and photo.</TabsContent>
      <TabsContent id="billing">Your card and invoices.</TabsContent>
      <TabsContent id="team">Who has access.</TabsContent>
    </Tabs>
  ),
  title: 'Navigation/Tabs/Line',
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

// The one indicator, which only the selected tab renders.
function indicator() {
  const lines = document.querySelectorAll<HTMLElement>(
    '[data-slot=tabs-indicator]',
  );
  const [line] = lines;
  if (!line || lines.length !== 1) throw new Error('Expected one indicator');
  return line;
}

async function settle() {
  await Promise.all(
    document.getAnimations().map((animation) => animation.finished),
  );
}

// The slide starts where the last line was: paused at its first frame, the
// new line covers the old one.
async function slidesFromLastTab() {
  const before = indicator().getBoundingClientRect();
  await userEvent.click(tab('Billing and invoices'));
  const line = indicator();
  await waitFor(() => expect(line.getAnimations().length).toBeGreaterThan(0));
  for (const animation of line.getAnimations()) {
    animation.pause();
    animation.currentTime = 0;
  }
  const start = line.getBoundingClientRect();
  await expect(Math.abs(start.left - before.left)).toBeLessThan(1);
  await expect(Math.abs(start.width - before.width)).toBeLessThan(1);
  for (const animation of line.getAnimations()) animation.finish();
}

function tab(name: string) {
  const found = [
    ...document.querySelectorAll<HTMLElement>('[data-slot=tabs-trigger]'),
  ].find((element) => element.textContent === name);
  if (!found) throw new Error(`No tab ${name}`);
  return found;
}

// The selected tab has a 2px line along its bottom edge, as wide as the tab
// and hidden from assistive technology; tabs are still at least 24px.
export const LineLook: Story = {
  play: async () => {
    await settle();
    const line = indicator();
    const style = getComputedStyle(line);
    await expect(tab('Profile')).toContainElement(line);
    await expect(line).toHaveAttribute('aria-hidden', 'true');
    await expect(style.borderBottomWidth).toBe('2px');
    await expect(style.bottom).toBe('0px');
    await expect(line.getBoundingClientRect().width).toBe(
      tab('Profile').getBoundingClientRect().width,
    );
    await expect(style.transitionProperty).toBe('width, height, translate');
    for (const element of document.querySelectorAll('[role=tab]')) {
      await expect(
        element.getBoundingClientRect().height,
      ).toBeGreaterThanOrEqual(24);
    }
  },
};

// The line moves to the tab selected, and sizes to it.
export const FollowsSelection: Story = {
  play: async () => {
    await userEvent.click(tab('Billing and invoices'));
    await settle();
    const line = indicator();
    await expect(tab('Billing and invoices')).toContainElement(line);
    await expect(line.getBoundingClientRect().width).toBe(
      tab('Billing and invoices').getBoundingClientRect().width,
    );
  },
};

export const SlidesLeftToRight: Story = { play: slidesFromLastTab };

// Right to left, the line stays anchored left, so the slide still starts
// where the last line was.
export const SlidesRightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: slidesFromLastTab,
};

// With reduced motion, the line jumps to the tab selected: base.css's
// near-zero transition leaves nothing for React Aria to slide.
export const ReducedMotion: Story = {
  play: async () => {
    await withReducedMotion(async () => {
      await userEvent.click(tab('Billing and invoices'));
      const line = indicator();
      await expect(getComputedStyle(line).transitionProperty).toBe('all');
      const box = line.getBoundingClientRect();
      const target = tab('Billing and invoices').getBoundingClientRect();
      await expect(box.left).toBe(target.left);
      await expect(box.width).toBe(target.width);
    });
  },
};

// Vertical, the line runs along the side facing the panel, in either
// direction.
export const LineVertical: Story = {
  args: { orientation: 'vertical' },
  play: async () => {
    await settle();
    const style = getComputedStyle(indicator());
    await expect(style.borderRightWidth).toBe('2px');
    await expect(style.right).toBe('0px');
    await expect(indicator().getBoundingClientRect().height).toBe(
      tab('Profile').getBoundingClientRect().height,
    );
  },
};

export const LineVerticalRightToLeft: Story = {
  args: { orientation: 'vertical' },
  globals: { locale: 'ar-EG' },
  play: async () => {
    await settle();
    const style = getComputedStyle(indicator());
    await expect(style.borderLeftWidth).toBe('2px');
    await expect(style.left).toBe('0px');
  },
};

// The default look marks the selected tab with a fill, not a line.
export const DefaultLookHasNoLine: Story = {
  args: { variant: 'default' },
  play: async () => {
    await expect(
      document.querySelector('[data-slot=tabs-indicator]'),
    ).toBeNull();
  },
};

// Forced colors keep the line, a border, in a system color; a disabled tab's
// line grays with its label.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvas }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    await settle();
    const style = getComputedStyle(indicator());
    await expect(style.borderBottomStyle).toBe('solid');
    await expect(style.borderBottomWidth).toBe('2px');
    await expect(style.borderBottomColor).not.toBe(
      flatBackground(canvas.getByRole('tabpanel')),
    );
  },
  tags: ['forced-colors'],
};

export const ForcedColorsDisabled: Story = {
  args: { isDisabled: true },
  parameters: ForcedColors.parameters,
  play: async () => {
    await settle();
    await expect(getComputedStyle(indicator()).borderBottomColor).toBe(
      getComputedStyle(tab('Profile')).color,
    );
  },
  tags: ['forced-colors'],
};
