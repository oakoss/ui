import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@oakoss/ui/components/ui/layout/carousel';
import { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { part } from '#/helpers/parts';

import {
  CarouselDemo,
  exposed,
  live,
  next,
  previous,
  slideOffset,
  slides,
} from './carousel-demo';

const meta = {
  component: CarouselDemo,
  title: 'Layout/Carousel',
} satisfies Meta<typeof CarouselDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

// A named carousel region of slides named "n of m"; only the slide on screen
// is in the accessibility tree, Previous starts disabled, and nothing is
// announced on load.
export const Default: Story = {
  play: async () => {
    const region = screen.getByRole('region', { name: 'Photos' });
    await expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    await waitFor(() => expect(slides()[0]).toHaveAccessibleName('1 of 5'));
    await expect(slides()[0]).toHaveAttribute('aria-roledescription', 'slide');
    await expect(exposed()).toEqual([slides()[0]]);
    await expect(previous()).toBeDisabled();
    await expect(next()).toBeEnabled();
    await expect(live()).toHaveRole('status');
    await expect(live()).toBeEmptyDOMElement();
  },
};

// Next moves a slide on, and the live region says which.
export const Step: Story = {
  play: async () => {
    await waitFor(() => expect(next()).toBeEnabled());
    await userEvent.click(next());
    await waitFor(() => expect(live()).toHaveTextContent('Slide 2 of 5'));
    await waitFor(() => expect(exposed()).toEqual([slides()[1]]));
    await expect(previous()).toBeEnabled();
  },
};

// Right to left, the first slide starts on the right and Next sits at the
// start of the line, pointing left.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    await waitFor(() => expect(next()).toBeEnabled());
    const region = part('carousel').getBoundingClientRect();
    await expect(next().getBoundingClientRect().right).toBeLessThan(
      region.left + 1,
    );
    await userEvent.click(next());
    await waitFor(() => expect(slideOffset(1, 'right')).toBeCloseTo(0, 0));
  },
};

// Vertical, the buttons sit above and below.
export const Vertical: Story = {
  args: { itemClassName: 'basis-full', orientation: 'vertical' },
  play: async () => {
    await waitFor(() => expect(next()).toBeEnabled());
    const content = part('carousel-content').getBoundingClientRect();
    await expect(next().getBoundingClientRect().top).toBeGreaterThan(
      content.bottom,
    );
    await expect(previous().getBoundingClientRect().bottom).toBeLessThan(
      content.top,
    );
    await userEvent.click(next());
    await waitFor(() => expect(live()).toHaveTextContent('Slide 2 of 5'));
  },
};

// Several slides per view: each is exposed, and the announcement names the
// slides on screen, whatever Embla steps by.
export const SeveralPerView: Story = {
  args: { count: 9, itemClassName: 'basis-1/3' },
  play: async () => {
    await waitFor(() => expect(exposed()).toHaveLength(3));
    await userEvent.click(next());
    await waitFor(() => expect(live()).toHaveTextContent('Slides 2 to 4 of 9'));
  },
};

// Looping a view at a time, the slides on screen wrap, and the announcement
// lists them in reading order.
export const LoopAnnouncement: Story = {
  args: {
    itemClassName: 'basis-1/3',
    opts: { align: 'start', loop: true, slidesToScroll: 'auto' },
  },
  play: async () => {
    await waitFor(() => expect(next()).toBeEnabled());
    await userEvent.click(next());
    await waitFor(() =>
      expect(live()).toHaveTextContent('Slides 4, 5 and 1 of 5'),
    );
  },
};

// Slides of uneven height, centered in the row, are announced left to
// right.
export const UnevenHeights: Story = {
  play: async () => {
    await waitFor(() => expect(next()).toBeEnabled());
    await userEvent.click(next());
    await waitFor(() => expect(live()).toHaveTextContent('Slides 2 to 4 of 9'));
  },
  render: () => (
    <div className="mx-auto w-80 py-14">
      <Carousel aria-label="Photos">
        <CarouselContent className="items-center">
          {Array.from({ length: 9 }, (_, index) => (
            <CarouselItem className="basis-1/3" key={index}>
              <div className={index % 2 === 0 ? 'h-24 border' : 'h-12 border'}>
                {index + 1}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

// Removing slides clears the last announcement rather than reading a slide
// that's gone.
function Shrinking() {
  const [count, setCount] = useState(5);
  return (
    <>
      <CarouselDemo count={count} />
      <Button
        onPress={() => {
          setCount(3);
        }}
      >
        Remove slides
      </Button>
    </>
  );
}

export const SlidesRemoved: Story = {
  play: async () => {
    await waitFor(() => expect(next()).toBeEnabled());
    await userEvent.click(next());
    await waitFor(() => expect(live()).toHaveTextContent('Slide 2 of 5'));
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove slides' }),
    );
    await waitFor(() => expect(slides()).toHaveLength(3));
    await waitFor(() => expect(live()).toBeEmptyDOMElement());
  },
  render: () => <Shrinking />,
};

// Looping, neither button disables.
export const Loop: Story = {
  args: { opts: { loop: true } },
  play: async () => {
    await waitFor(() => expect(previous()).toBeEnabled());
    await expect(next()).toBeEnabled();
  },
};

// Before Embla starts, as a server renders it, every slide is exposed and
// both buttons are disabled.
export const FirstFrame: Story = {
  play: async () => {
    const html = renderToString(<CarouselDemo />);
    await expect(html).not.toContain('inert');
    await expect(html.match(/disabled=""/gu)).toHaveLength(2);
  },
};

// Forced colors repaint the buttons and keep the focus outline.
export const ForcedColors: Story = {
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    await waitFor(() => expect(next()).toBeEnabled());
    const style = getComputedStyle(next());
    await expect(style.borderTopStyle).toBe('solid');
    await expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    next().focus();
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}{Tab}');
    await expect(getComputedStyle(next()).outlineStyle).toBe('solid');
  },
  tags: ['forced-colors'],
};
