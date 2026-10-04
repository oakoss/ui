import type { Meta, StoryObj } from '@storybook/react-vite';

import { IconResolverContext } from '@oakoss/ui/components/icon-placeholder';
import * as icons from '@oakoss/ui/components/icons';
import { expect, spyOn } from 'storybook/test';

function IconGallery() {
  return (
    <ul className="grid grid-cols-4 gap-4 text-sm">
      {Object.entries(icons).map(([name, Icon]) => (
        <li className="flex items-center gap-2" key={name}>
          <Icon className="size-4" />
          {name}
        </li>
      ))}
    </ul>
  );
}

const meta = {
  component: IconGallery,
  title: 'Foundations/Icons',
} satisfies Meta<typeof IconGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

// The preview's resolver renders Lucide, keeping each icon's props.
export const Gallery: Story = {
  beforeEach: () => {
    spyOn(console, 'warn');
  },
  play: async ({ canvasElement }) => {
    await expect(console.warn).not.toHaveBeenCalled();
    const items = [...canvasElement.querySelectorAll('li')];
    await expect(items).toHaveLength(Object.keys(icons).length);
    const unresolved = items.filter(
      (item) =>
        item.querySelector('svg.lucide.size-4[aria-hidden="true"]') === null,
    );
    await expect(unresolved).toEqual([]);
  },
};

// What an install sees if shadcn didn't swap the icons: a hidden square
// and one warning, however many icons render.
export const Fallback: Story = {
  // Spied per story: Storybook restores spies between stories.
  beforeEach: () => {
    spyOn(console, 'warn');
  },
  decorators: [
    (Story) => (
      <IconResolverContext value={undefined}>
        <Story />
      </IconResolverContext>
    ),
  ],
  play: async ({ canvasElement }) => {
    const svgs = [...canvasElement.querySelectorAll(':scope li svg')];
    await expect(svgs).toHaveLength(Object.keys(icons).length);
    const wrong = svgs.filter(
      (svg) =>
        svg.getAttribute('aria-hidden') !== 'true' ||
        !svg.classList.contains('size-4') ||
        svg.classList.contains('lucide'),
    );
    await expect(wrong).toEqual([]);
    await expect(console.warn).toHaveBeenCalledTimes(1);
  },
};
