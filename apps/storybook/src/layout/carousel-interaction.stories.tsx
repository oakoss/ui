import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@oakoss/ui/components/ui/layout/carousel';
import { createRef, useLayoutEffect, useState } from 'react';
import { Link } from 'react-aria-components';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { withReducedMotion } from '#/helpers/motion';
import { part } from '#/helpers/parts';

import {
  CarouselDemo,
  exposed,
  frames,
  live,
  next,
  previous,
  slideOffset,
  slides,
} from './carousel-demo';

const meta = {
  component: CarouselDemo,
  title: 'Layout/Carousel/Interaction',
} satisfies Meta<typeof CarouselDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

function caption(index: number) {
  return <Input aria-label={`Caption ${String(index + 1)}`} />;
}

// At the last slide Next disables, and focus passes to Previous rather than
// dropping to the page.
export const FocusAtTheEnd: Story = {
  args: { count: 2 },
  play: async () => {
    await waitFor(() => expect(next()).toBeEnabled());
    next().focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(next()).toBeDisabled());
    await expect(previous()).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(previous()).toBeDisabled());
    await expect(next()).toHaveFocus();
  },
};

// The carousel takes no arrow keys, so a text field in a slide keeps them.
export const InputInSlide: Story = {
  args: { renderSlide: caption },
  play: async () => {
    const input = screen.getByRole('textbox', { name: 'Caption 1' });
    await userEvent.type(input, 'abc');
    await expect(input).toHaveValue('abc');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(input).toHaveProperty('selectionStart', 1);
    await expect(live()).toBeEmptyDOMElement();
  },
};

// A slide holding focus stays reachable after it scrolls out of view, until
// focus leaves it.
const story: { api?: CarouselApi } = {};

export const FocusedSlideStays: Story = {
  args: {
    renderSlide: caption,
    setApi: (api) => {
      story.api = api;
    },
  },
  play: async () => {
    const input = screen.getByRole('textbox', { name: 'Caption 1' });
    input.focus();
    await waitFor(() => expect(story.api).toBeDefined());
    const settled = new Promise((resolve) => {
      story.api?.on('settle', resolve);
    });
    story.api?.scrollNext();
    await settled;
    await waitFor(() => expect(exposed()).toEqual([slides()[0], slides()[1]]));
    await expect(input).toHaveFocus();
    // After the settle, so only focus leaving can hide the slide.
    next().focus();
    await waitFor(() => expect(exposed()).toEqual([slides()[1]]));
  },
};

async function dragAcross(target: HTMLElement) {
  const box = target.getBoundingClientRect();
  const y = box.top + box.height / 2;
  await userEvent.pointer([
    {
      coords: { clientX: box.right - 20, clientY: y },
      keys: '[MouseLeft>]',
      target,
    },
    { coords: { clientX: box.right - 120, clientY: y }, target },
    {
      coords: { clientX: box.left + 20, clientY: y },
      keys: '[/MouseLeft]',
      target,
    },
  ]);
}

// Dragging a slide doesn't activate the button or link under the pointer,
// though a click does.
function Pressable({ kind }: { kind: 'button' | 'link' }) {
  const [count, setCount] = useState(0);
  const onPress = () => {
    setCount((value) => value + 1);
  };
  return (
    <CarouselDemo
      renderSlide={(index) => {
        const label = index === 0 ? `Pressed ${String(count)}` : index + 1;
        return kind === 'button' ? (
          <Button className="size-full" onPress={onPress} variant="ghost">
            {label}
          </Button>
        ) : (
          <Link className="size-full" onPress={onPress}>
            {label}
          </Link>
        );
      }}
    />
  );
}

export const DragDoesNotPress: Story = {
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Pressed 0' }));
    await dragAcross(screen.getByRole('button', { name: 'Pressed 1' }));
    await waitFor(() => expect(live()).toHaveTextContent('Slide 2 of 5'));
    await expect(screen.getByText('Pressed 1')).toBeInTheDocument();
  },
  render: () => <Pressable kind="button" />,
};

export const DragDoesNotFollowLink: Story = {
  play: async () => {
    await userEvent.click(screen.getByRole('link', { name: 'Pressed 0' }));
    await dragAcross(screen.getByRole('link', { name: 'Pressed 1' }));
    await waitFor(() => expect(live()).toHaveTextContent('Slide 2 of 5'));
    await expect(screen.getByText('Pressed 1')).toBeInTheDocument();
  },
  render: () => <Pressable kind="link" />,
};

function statusOf(name: string) {
  return screen
    .getByRole('region', { name })
    .querySelector(':scope > [role=status]');
}

// A drag on a carousel nested in a slide moves only the nested one.
export const NestedDrag: Story = {
  play: async () => {
    const [outer, inner] = [statusOf('Photos'), statusOf('Inner')];
    await dragAcross(screen.getByText('Inner 1'));
    await waitFor(() => expect(inner).toHaveTextContent('Slide 2 of 3'));
    await expect(outer).toBeEmptyDOMElement();
  },
  render: () => (
    <CarouselDemo
      renderSlide={(index) =>
        index === 0 ? (
          <CarouselDemo
            aria-label="Inner"
            count={3}
            renderSlide={(inner) => `Inner ${String(inner + 1)}`}
          />
        ) : (
          index + 1
        )
      }
    />
  ),
};

// A consumer's refs reach the slide and the buttons, the slide's already in
// a mount effect, and the slide keeps its name.
const itemRef = createRef<HTMLDivElement>();
const nextRef = createRef<HTMLButtonElement>();
const mounted: { item: HTMLDivElement | null } = { item: null };

function RefsDemo() {
  useLayoutEffect(() => {
    mounted.item = itemRef.current;
  }, []);
  return (
    <div className="mx-auto w-80 py-14">
      <Carousel aria-label="Photos">
        <CarouselContent>
          <CarouselItem ref={itemRef}>1</CarouselItem>
          <CarouselItem>2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext ref={nextRef} />
      </Carousel>
    </div>
  );
}

export const ConsumerRefs: Story = {
  play: async () => {
    await expect(mounted.item).toBe(slides()[0]);
    await waitFor(() => expect(slides()[0]).toHaveAccessibleName('1 of 2'));
    await expect(nextRef.current).toBe(next());
  },
  render: () => <RefsDemo />,
};

// Grabbing the row while a step is still moving holds the announcement
// until the pointer lets go.
export const HeldDrag: Story = {
  play: async () => {
    await waitFor(() => expect(next()).toBeEnabled());
    await userEvent.click(next());
    const box = part('carousel-content').getBoundingClientRect();
    const [x, y] = [box.left + box.width / 2, box.top + box.height / 2];
    const target = part('carousel-content');
    await userEvent.pointer([
      { coords: { clientX: x, clientY: y }, keys: '[MouseLeft>]', target },
      { coords: { clientX: x - 30, clientY: y }, target },
    ]);
    await frames(40);
    await expect(live()).toBeEmptyDOMElement();
    // A separate userEvent call doesn't remember the held button, so the
    // release is dispatched where Embla listens for it.
    document.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: x - 30, clientY: y }),
    );
    await waitFor(() => expect(live()).not.toBeEmptyDOMElement());
  },
};

// With reduced motion, a step jumps rather than animating.
export const ReducedMotion: Story = {
  play: async () => {
    await withReducedMotion(async () => {
      await waitFor(() => expect(next()).toBeEnabled());
      await userEvent.click(next());
      // A jump landed on the third frame; the animation takes about 40.
      await frames(6);
      await expect(slideOffset(1)).toBeCloseTo(0, 0);
    });
  },
};
