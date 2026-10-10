import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@oakoss/ui/components/ui/navigation/pagination';
import { expect, userEvent } from 'storybook/test';

import { contrast } from '../color';
import { paintedColor } from '../paint';

const meta = {
  component: Pagination,
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#2" isActive>
            <span data-testid="current">2</span>
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#3">3</PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  title: 'Navigation/Pagination/States',
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

const forcedColors = {
  a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
};

function links() {
  return [
    ...document.querySelectorAll<HTMLElement>('[data-slot=pagination-link]'),
  ];
}

function pageColor() {
  return getComputedStyle(document.body).backgroundColor;
}

async function settle() {
  for (const link of links()) delete link.dataset.hovered;
  await Promise.all(
    document.getAnimations().map((animation) => animation.finished),
  );
}

// The current page is marked by weight and a border that meets 3:1, not by
// color alone.
export const CurrentPage: Story = {
  play: async () => {
    await settle();
    const [other, current] = links().map((link) => getComputedStyle(link));
    await expect(current?.fontWeight).toBe('600');
    await expect(other?.fontWeight).not.toBe('600');
    await expect(other?.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    await expect(
      contrast(current?.borderTopColor ?? '', pageColor()),
    ).toBeGreaterThanOrEqual(3);
  },
};

// Page links have 44px hit areas, a 44px pitch apart, so each stays its own.
export const TargetSize: Story = {
  play: async () => {
    const [first, second] = links();
    if (!first || !second) throw new Error('No links');
    const area = getComputedStyle(first, '::after');
    await expect(area.width).toBe('44px');
    await expect(area.height).toBe('44px');
    const [a, b] = [first, second].map((link) => {
      const box = link.getBoundingClientRect();
      return box.left + box.width / 2;
    });
    await expect(Math.abs((b ?? 0) - (a ?? 0))).toBeGreaterThanOrEqual(44);
  },
};

// A hovered page link tints with the state layer; the story ends hovered so
// axe checks that state.
export const Hover: Story = {
  play: async () => {
    await settle();
    const [first] = links();
    if (!first) throw new Error('No link');
    const rest = getComputedStyle(first).backgroundImage;
    first.dataset.hovered = 'true';
    const hovered = getComputedStyle(first).backgroundImage;
    await expect(hovered).toContain('linear-gradient');
    await expect(hovered).not.toBe(rest);
  },
};

export const FocusRing: Story = {
  play: async () => {
    await userEvent.tab();
    const [first] = links();
    if (!first) throw new Error('No link');
    await expect(first).toHaveFocus();
    await settle();
    await expect(getComputedStyle(first).outlineStyle).toBe('solid');
  },
};

// Forced colors give the current page the system's selection colors, with
// its number painted over them rather than behind the text backplate.
export const ForcedColors: Story = {
  parameters: forcedColors,
  play: async ({ canvas }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    await settle();
    const [other, current] = links().map((link) => getComputedStyle(link));
    await expect(current?.backgroundColor).not.toBe(other?.backgroundColor);
    await expect(current?.borderTopColor).toBe(current?.backgroundColor);
    await expect(
      contrast(current?.color ?? '', current?.backgroundColor ?? ''),
    ).toBeGreaterThan(4.5);
    await expect(await paintedColor(canvas.getByTestId('current'))).not.toBe(
      await paintedColor(canvas.getByRole('navigation')),
    );
  },
  tags: ['forced-colors'],
};

// The hover layer would wash over the selection fill, so the current page
// drops it in forced colors.
export const ForcedColorsHover: Story = {
  parameters: forcedColors,
  play: async ({ canvas }) => {
    await settle();
    const current = canvas.getByRole('link', { current: 'page' });
    current.dataset.hovered = 'true';
    await expect(getComputedStyle(current).backgroundImage).toBe('none');
  },
  tags: ['forced-colors'],
};

// Opted out of forced colors, the current page sets its focus outline to the
// system's selection color itself.
export const ForcedColorsFocus: Story = {
  parameters: forcedColors,
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.tab();
    const current = canvas.getByRole('link', { current: 'page' });
    await expect(current).toHaveFocus();
    await settle();
    const style = getComputedStyle(current);
    await expect(style.outlineColor).toBe(style.backgroundColor);
  },
  tags: ['forced-colors'],
};
