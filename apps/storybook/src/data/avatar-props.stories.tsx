import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@oakoss/ui/components/ui/data/avatar';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { createRef, useState } from 'react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { AvatarDemo, type AvatarDemoProps, broken, photo } from './avatar-demo';

const meta = {
  args: { src: photo },
  render: (args) => <AvatarDemo {...args} />,
  title: 'Data/Avatar/Props',
} satisfies Meta<AvatarDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// The consumer's handlers and ref still reach the image, and srcSet alone is
// an image source.
const onLoad = fn<() => void>();
const onError = fn<() => void>();
const ref = createRef<HTMLImageElement>();

export const Passthrough: Story = {
  beforeEach: () => {
    onLoad.mockClear();
    onError.mockClear();
  },
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(onLoad).toHaveBeenCalledTimes(1);
      await expect(onError).toHaveBeenCalledTimes(1);
    });
    await expect(ref.current).toBeInstanceOf(HTMLImageElement);
    const srcSetOnly = canvasElement.querySelectorAll(
      '[data-slot=avatar-image]',
    )[2];
    await waitFor(async () => {
      await expect(srcSetOnly).toHaveAttribute('data-status', 'loaded');
    });
  },
  render: () => (
    <div className="flex gap-3">
      <Avatar>
        <AvatarImage onLoad={onLoad} ref={ref} src={photo} />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage onError={onError} src={broken} />
        <AvatarFallback>GH</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage srcSet={`${photo} 1x`} />
        <AvatarFallback>KJ</AvatarFallback>
      </Avatar>
    </div>
  ),
};

// A callback ref sees the image once per mount, through status changes, and
// its cleanup runs when the image goes.
const attached = fn<(node: HTMLImageElement | null) => void>();
const detached = fn<() => void>();

export const CallbackRef: Story = {
  beforeEach: () => {
    attached.mockClear();
    detached.mockClear();
  },
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(canvas.getByRole('img', { name: 'Ada' })).toBeVisible();
    });
    await expect(attached).toHaveBeenCalledTimes(1);
    await expect(attached).toHaveBeenCalledWith(expect.any(HTMLImageElement));
    await userEvent.click(canvas.getByRole('button', { name: 'Remove' }));
    await expect(detached).toHaveBeenCalledTimes(1);
    await expect(attached).toHaveBeenCalledTimes(1);
  },
  render: function Render() {
    const [shown, setShown] = useState(true);
    return (
      <div className="flex items-center gap-3">
        <Avatar>
          {shown ? (
            <AvatarImage
              alt="Ada"
              ref={(node) => {
                attached(node);
                return detached;
              }}
              src={photo}
            />
          ) : null}
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Button onPress={() => setShown(false)} size="sm" variant="outline">
          Remove
        </Button>
      </div>
    );
  },
};
