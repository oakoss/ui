import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from '@oakoss/ui/components/ui/navigation/breadcrumb';
import { expect, userEvent } from 'storybook/test';

import { atViewportWidth } from '../viewport';

const meta = {
  component: Breadcrumb,
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  title: 'Navigation/Breadcrumb/States',
} satisfies Meta<typeof Breadcrumb>;

export default meta;

type Story = StoryObj<typeof meta>;

function ringColor() {
  const probe = document.createElement('div');
  probe.style.color = 'var(--ring)';
  document.body.append(probe);
  const { color } = getComputedStyle(probe);
  probe.remove();
  return color;
}

async function settle(element: Element) {
  await Promise.all(element.getAnimations().map((a) => a.finished));
}

// The current page reads as the foreground at full strength, not faded like
// a disabled link, whichever part renders it.
export const CurrentPage: Story = {
  play: async ({ canvas }) => {
    const link = getComputedStyle(canvas.getByRole('link', { name: 'Home' }));
    for (const name of ['Breadcrumb', 'Settings']) {
      const current = getComputedStyle(canvas.getByRole('link', { name }));
      await expect(current.opacity).toBe('1');
      await expect(current.color).not.toBe(link.color);
    }
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Breadcrumb {...args} aria-label="Page">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#home">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Breadcrumb {...args} aria-label="Link">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#account">Account</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
};

// A disabled trail fades its links but not the current page, which React Aria
// also marks disabled.
export const Disabled: Story = {
  play: async ({ canvas }) => {
    await expect(
      getComputedStyle(canvas.getByRole('link', { name: 'Home' })).opacity,
    ).toBe('0.5');
    await expect(
      getComputedStyle(canvas.getByRole('link', { name: 'Settings' })).opacity,
    ).toBe('1');
  },
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList isDisabled>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#settings">Settings</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

// A hovered link turns the foreground color, like the current page.
export const Hover: Story = {
  play: async ({ canvas }) => {
    const home = canvas.getByRole('link', { name: 'Home' });
    const current = getComputedStyle(
      canvas.getByRole('link', { name: 'Breadcrumb' }),
    ).color;
    delete home.dataset.hovered;
    await settle(home);
    await expect(getComputedStyle(home).color).not.toBe(current);
    home.dataset.hovered = 'true';
    await settle(home);
    await expect(getComputedStyle(home).color).toBe(current);
  },
};

// Keyboard focus draws the ring: its color, width and a gap off the text.
export const FocusRing: Story = {
  play: async ({ canvas }) => {
    const home = canvas.getByRole('link', { name: 'Home' });
    await expect(getComputedStyle(home).outlineStyle).toBe('none');
    await userEvent.tab();
    await expect(home).toHaveFocus();
    await settle(home);
    const style = getComputedStyle(home);
    await expect(style.outlineStyle).toBe('solid');
    await expect(style.outlineWidth).toBe('3px');
    await expect(style.outlineOffset).toBe('2px');
    await expect(style.outlineColor).toBe(ringColor());
  },
};

// A pointer press focuses a link without drawing the ring. Without an href,
// the press doesn't navigate the test page away.
export const PointerFocus: Story = {
  play: async ({ canvas }) => {
    const home = canvas.getByRole('link', { name: 'Home' });
    await userEvent.click(home);
    await expect(home).toHaveFocus();
    await expect(getComputedStyle(home).outlineStyle).toBe('none');
  },
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

// Links are text height, so WCAG's spacing exception carries them: a 24px
// circle on each link's center stays clear of the others, even with every
// item wrapped onto its own line on a phone.
export const TargetSpacing: Story = {
  play: async ({ canvas }) => {
    await atViewportWidth(375, async () => {
      await expect(matchMedia('(min-width: 40rem)').matches).toBe(false);
      const centers = canvas.getAllByRole('link').map((link) => {
        const box = link.getBoundingClientRect();
        return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      });
      await expect(new Set(centers.map(({ y }) => y)).size).toBeGreaterThan(1);
      const distances = centers.flatMap((a, index) =>
        centers.slice(index + 1).map((b) => Math.hypot(a.x - b.x, a.y - b.y)),
      );
      await expect(Math.min(...distances)).toBeGreaterThanOrEqual(24);
    });
  },
  render: (args) => (
    <div className="w-0">
      <Breadcrumb {...args}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#home">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#docs">Docs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#ui">UI</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
};

// Forced colors draw no box around a link at rest.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvas }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const home = getComputedStyle(canvas.getByRole('link', { name: 'Home' }));
    await expect(home.outlineStyle).toBe('none');
  },
  tags: ['forced-colors'],
};
