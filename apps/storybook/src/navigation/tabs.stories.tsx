import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@oakoss/ui/components/ui/navigation/tabs';
import { expect, userEvent } from 'storybook/test';

import { part } from '../parts';

const meta = {
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
  title: 'Navigation/Tabs',
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

// A named tab list; arrow keys move the selection and show its panel.
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('tablist', { name: 'Account' }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: 'Profile' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Billing' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(
      'Your card and invoices.',
    );
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'Team' })).toHaveFocus();
    const list = part('tabs-list').getBoundingClientRect();
    await expect(
      part('tabs-content').getBoundingClientRect().top,
    ).toBeGreaterThanOrEqual(list.bottom);
  },
};

// With manual activation, arrows move focus and Enter selects.
export const ManualActivation: Story = {
  args: { keyboardActivation: 'manual' },
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    const billing = canvas.getByRole('tab', { name: 'Billing' });
    await expect(billing).toHaveFocus();
    await expect(billing).toHaveAttribute('aria-selected', 'false');
  },
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('tab', { name: 'Billing' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const list = part('tabs-list').getBoundingClientRect();
    const panel = part('tabs-content').getBoundingClientRect();
    await expect(panel.left).toBeGreaterThan(list.left);
    const [profile, billing] = canvas
      .getAllByRole('tab')
      .map((tab) => tab.getBoundingClientRect());
    await expect(billing?.top).toBeGreaterThan(profile?.top ?? 0);
    await expect(
      getComputedStyle(canvas.getByRole('tab', { name: 'Profile' }))
        .justifyContent,
    ).toBe('flex-start');
  },
};

// A horizontal Tabs in a vertical one's panel keeps its own layout: its line
// sits under the tab, and its tabs stay centered.
export const Nested: Story = {
  play: async ({ canvas }) => {
    const inner = canvas.getByRole('tab', { name: 'Inbox' });
    const line = getComputedStyle(inner, '::after');
    await expect(line.borderBottomWidth).toBe('2px');
    await expect(line.borderRightWidth).toBe('0px');
    await expect(getComputedStyle(inner).justifyContent).toBe('center');
  },
  render: () => (
    <Tabs className="w-120" orientation="vertical" variant="line">
      <TabsList aria-label="Sections">
        <TabsTrigger id="mail">Mail</TabsTrigger>
      </TabsList>
      <TabsContent id="mail">
        <Tabs variant="line">
          <TabsList aria-label="Folders">
            <TabsTrigger id="inbox">Inbox</TabsTrigger>
            <TabsTrigger id="sent">Sent</TabsTrigger>
          </TabsList>
          <TabsContent id="inbox">No new mail.</TabsContent>
          <TabsContent id="sent">Nothing sent.</TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  ),
};

// Right to left, ArrowLeft moves to the next tab.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: 'Billing' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

export const DisabledTab: Story = {
  args: { disabledKeys: ['billing'] },
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Team' })).toHaveFocus();
    await expect(
      getComputedStyle(canvas.getByRole('tab', { name: 'Billing' })).opacity,
    ).toBe('0.5');
  },
};

// A panel with nothing focusable inside is a tab stop with the focus outline,
// drawn inside its edge.
export const PanelFocus: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.tab();
    const panel = canvas.getByRole('tabpanel');
    await expect(panel).toHaveFocus();
    const style = getComputedStyle(panel);
    await expect(style.outlineStyle).toBe('solid');
    await expect(style.outlineOffset).toMatch(/^-/u);
  },
};

// Every part takes a consumer's className.
export const ClassNames: Story = {
  play: async () => {
    await expect(part('tabs')).toHaveClass('w-96');
    await expect(part('tabs-list')).toHaveClass('w-full');
    await expect(part('tabs-trigger')).toHaveClass('tracking-wide');
    await expect(part('tabs-content')).toHaveClass('italic');
  },
  render: (args) => (
    <Tabs {...args} className="w-96">
      <TabsList aria-label="Account" className="w-full">
        <TabsTrigger className="tracking-wide" id="profile">
          Profile
        </TabsTrigger>
      </TabsList>
      <TabsContent className="italic" id="profile">
        Your name and photo.
      </TabsContent>
    </Tabs>
  ),
};
