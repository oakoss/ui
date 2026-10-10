import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@oakoss/ui/components/ui/navigation/tabs';
import { expect, userEvent } from 'storybook/test';

import { contrast } from '../color';
import { paintedColor } from '../paint';
import { part } from '../parts';

const meta = {
  args: { disabledKeys: ['team'] },
  component: Tabs,
  render: (args) => (
    <Tabs {...args} className="w-96">
      <TabsList aria-label="Account">
        <TabsTrigger id="profile">Profile</TabsTrigger>
        <TabsTrigger id="billing">Billing</TabsTrigger>
        <TabsTrigger id="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent id="profile">Your name and photo.</TabsContent>
      <TabsContent id="billing">Your card and invoices.</TabsContent>
      <TabsContent id="team">Who has access.</TabsContent>
    </Tabs>
  ),
  title: 'Navigation/Tabs/States',
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

function after(element: HTMLElement | undefined) {
  if (!element) throw new Error('No tab');
  return getComputedStyle(element, '::after');
}

async function settle() {
  for (const tab of tabs()) delete tab.dataset.hovered;
  await Promise.all(
    document.getAnimations().map((animation) => animation.finished),
  );
}

function tabs() {
  return [
    ...document.querySelectorAll<HTMLElement>('[data-slot=tabs-trigger]'),
  ];
}

// In the default look the selected tab is a filled chip with readable text,
// in a list as tall as a small control.
export const DefaultLook: Story = {
  play: async () => {
    await settle();
    const [selected, other] = tabs().map((tab) => getComputedStyle(tab));
    await expect(selected?.backgroundColor).not.toBe(other?.backgroundColor);
    await expect(
      contrast(selected?.color ?? '', selected?.backgroundColor ?? ''),
    ).toBeGreaterThan(4.5);
    await expect(part('tabs-list').getBoundingClientRect().height).toBe(32);
  },
};

// Hovered, an unselected tab's label darkens. Ends hovered so axe checks
// that state.
export const Hover: Story = {
  play: async () => {
    await settle();
    const [, other] = tabs();
    if (!other) throw new Error('No tab');
    const rest = getComputedStyle(other).color;
    other.dataset.hovered = 'true';
    await Promise.all(
      other.getAnimations().map((animation) => animation.finished),
    );
    await expect(getComputedStyle(other).color).not.toBe(rest);
  },
};

// In the line look the selected tab has a 2px line along its bottom edge and
// the others none, so the line survives forced colors; tabs are still at
// least 24px.
export const LineLook: Story = {
  args: { variant: 'line' },
  play: async () => {
    const [selected, other] = tabs();
    await expect(after(selected).borderBottomWidth).toBe('2px');
    await expect(after(selected).position).toBe('absolute');
    await expect(after(selected).bottom).toBe('0px');
    await expect(after(other).borderBottomWidth).toBe('0px');
    for (const tab of tabs()) {
      await expect(tab.getBoundingClientRect().height).toBeGreaterThanOrEqual(
        24,
      );
    }
  },
};

// Vertical, the line runs along the side facing the panel, in either
// direction.
export const LineVertical: Story = {
  args: { orientation: 'vertical', variant: 'line' },
  play: async () => {
    const [selected] = tabs();
    await expect(after(selected).borderRightWidth).toBe('2px');
    await expect(after(selected).right).toBe('0px');
  },
};

export const LineVerticalRightToLeft: Story = {
  args: { orientation: 'vertical', variant: 'line' },
  globals: { locale: 'ar-EG' },
  play: async () => {
    const [selected] = tabs();
    await expect(after(selected).borderLeftWidth).toBe('2px');
    await expect(after(selected).left).toBe('0px');
  },
};

export const FocusRing: Story = {
  play: async () => {
    await userEvent.tab();
    await expect(
      getComputedStyle(tabs()[0] ?? document.body).outlineStyle,
    ).toBe('solid');
  },
};

// Forced colors give the selected tab the system's selection colors, and a
// disabled tab the system's disabled color.
export const ForcedColors: Story = {
  // In High Contrast the user's system colors set contrast, and axe's rule
  // misreads the forced colors.
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    await settle();
    const [selected, other, disabled] = tabs().map((tab) =>
      getComputedStyle(tab),
    );
    await expect(selected?.backgroundColor).not.toBe(other?.backgroundColor);
    await expect(
      contrast(selected?.color ?? '', selected?.backgroundColor ?? ''),
    ).toBeGreaterThan(4.5);
    await expect(disabled?.color).not.toBe(other?.color);
    // The panel isn't a control, so it draws no box at rest.
    await expect(getComputedStyle(part('tabs-content')).outlineStyle).toBe(
      'none',
    );
  },
  tags: ['forced-colors'],
};

// Opted out of forced colors, the selected tab sets its focus outline to the
// system's selection color itself.
export const ForcedColorsFocus: Story = {
  parameters: ForcedColors.parameters,
  play: async ({ canvas }) => {
    await userEvent.tab();
    const tab = canvas.getByRole('tab', { name: 'Profile' });
    await expect(tab).toHaveFocus();
    await settle();
    const style = getComputedStyle(tab);
    await expect(style.outlineColor).toBe(style.backgroundColor);
  },
  tags: ['forced-colors'],
};

// A disabled tab stays gray even when it's the selected one.
export const ForcedColorsSelectedDisabled: Story = {
  args: { isDisabled: true },
  parameters: ForcedColors.parameters,
  play: async () => {
    await settle();
    const [selected, other] = tabs().map((tab) => getComputedStyle(tab));
    await expect(selected?.color).toBe(other?.color);
  },
  tags: ['forced-colors'],
};

// Forced colors draw a page-colored backplate behind text, which would hide
// the selected tab's light label; the selected tab opts out.
export const ForcedColorsLabel: Story = {
  parameters: ForcedColors.parameters,
  play: async ({ canvas }) => {
    await settle();
    // A tab is tight around its label, so compare against the page, which
    // the backplate would match.
    await expect(await paintedColor(canvas.getByTestId('label'))).not.toBe(
      await paintedColor(canvas.getByRole('tabpanel')),
    );
  },
  render: (args) => (
    <Tabs {...args} className="w-96">
      <TabsList aria-label="Account">
        <TabsTrigger id="profile">
          <span data-testid="label">Profile</span>
        </TabsTrigger>
        <TabsTrigger id="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent id="profile">Your name and photo.</TabsContent>
      <TabsContent id="billing">Your card and invoices.</TabsContent>
    </Tabs>
  ),
  tags: ['forced-colors'],
};
