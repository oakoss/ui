import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@oakoss/ui/components/ui/surfaces/card';
import { expect } from 'storybook/test';

import { CardDemo, type CardDemoProps, part } from './card-demo';

const meta = {
  args: { className: 'w-80' },
  render: (args) => <CardDemo {...args} />,
  title: 'Surfaces/Card/Layout',
} satisfies Meta<CardDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// The action sits at the header's end, beside both the title and the
// description, and the title takes the rest of the row.
export const Action: Story = {
  play: async () => {
    const header = part('card-header').getBoundingClientRect();
    const action = part('card-action').getBoundingClientRect();
    const title = part('card-title').getBoundingClientRect();
    const description = part('card-description').getBoundingClientRect();
    await expect(Math.abs(header.right - 24 - action.right)).toBeLessThan(1);
    await expect(action.top).toBe(title.top);
    // The action spans both rows, so the description sits right under the
    // title, one header gap below it, not below the button.
    await expect(description.top - title.bottom).toBeCloseTo(4, 0);
    await expect(title.right).toBeLessThanOrEqual(action.left);
    await expect(title.width).toBeGreaterThan(150);
  },
};

function cardImage() {
  const image = document.querySelector('[data-slot=card] > img');
  if (!(image instanceof HTMLElement)) throw new Error('No image');
  return image;
}

const lake = (
  <img
    alt=""
    className="aspect-video w-full bg-muted object-cover"
    src="data:image/gif;base64,R0lGODlhAQABAAAAACw="
  />
);

// An image as the first child sits flush with the card's top edge.
export const Image: Story = {
  play: async () => {
    await expect(getComputedStyle(part('card')).paddingTop).toBe('0px');
    await expect(cardImage().getBoundingClientRect().top).toBe(
      part('card').getBoundingClientRect().top + 1,
    );
  },
  render: (args) => (
    <Card {...args}>
      {lake}
      <CardHeader>
        <CardTitle>Lake at dawn</CardTitle>
      </CardHeader>
    </Card>
  ),
};

// An image as the last child, above the card's bottom padding, keeps rounded
// bottom corners that the card's own clipping doesn't reach.
export const ImageLast: Story = {
  play: async () => {
    await expect(getComputedStyle(cardImage()).borderBottomLeftRadius).toBe(
      getComputedStyle(part('card')).borderBottomLeftRadius,
    );
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Lake at dawn</CardTitle>
      </CardHeader>
      {lake}
    </Card>
  ),
};

// A border below the header or above the footer gets the card's spacing.
export const Borders: Story = {
  play: async () => {
    await expect(getComputedStyle(part('card-header')).paddingBottom).toBe(
      '24px',
    );
    await expect(getComputedStyle(part('card-footer')).paddingTop).toBe('24px');
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader className="border-b">
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>Content</CardContent>
      <CardFooter className="border-t">Footer</CardFooter>
    </Card>
  ),
};

export const BordersSmall: Story = {
  ...Borders,
  args: { size: 'sm' },
  play: async () => {
    await expect(getComputedStyle(part('card-header')).paddingBottom).toBe(
      '16px',
    );
    await expect(getComputedStyle(part('card-footer')).paddingTop).toBe('16px');
  },
};

// A part's className wins over the spacing and title size it reads, in
// either size, so content can run edge to edge.
export const PartClassName: Story = {
  args: { size: 'sm' },
  play: async () => {
    await expect(getComputedStyle(part('card-content')).paddingLeft).toBe(
      '0px',
    );
    await expect(getComputedStyle(part('card-title')).fontSize).toBe('18px');
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle className="text-lg">Files</CardTitle>
      </CardHeader>
      <CardContent className="px-0">Full width</CardContent>
    </Card>
  ),
};

// A card inside a card of another size keeps its own spacing and title size.
export const Nested: Story = {
  args: { className: 'w-96', size: 'sm' },
  play: async () => {
    const [, inner] = document.querySelectorAll('[data-slot=card-content]');
    const [, innerTitle] = document.querySelectorAll('[data-slot=card-title]');
    if (!(inner instanceof HTMLElement && innerTitle instanceof HTMLElement))
      throw new Error('No inner card');
    await expect(getComputedStyle(inner).paddingLeft).toBe('24px');
    await expect(getComputedStyle(innerTitle).fontSize).toBe('16px');
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Outer</CardTitle>
      </CardHeader>
      <CardContent>
        <Card>
          <CardHeader>
            <CardTitle>Inner</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      </CardContent>
    </Card>
  ),
};
