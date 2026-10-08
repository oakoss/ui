import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@oakoss/ui/components/ui/data/avatar';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { type ReactElement, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, userEvent, waitFor } from 'storybook/test';

import { part } from '../parts';
import { AvatarDemo, type AvatarDemoProps, broken, photo } from './avatar-demo';
import servedPhoto from './avatar-photo.svg?url';

const meta = {
  args: { src: photo },
  render: (args) => <AvatarDemo {...args} />,
  title: 'Data/Avatar/Loading',
} satisfies Meta<AvatarDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

async function settled(
  status: 'error' | 'loaded',
  root: ParentNode = document,
) {
  await waitFor(async () => {
    await expect(part('avatar-image', root)).toHaveAttribute(
      'data-status',
      status,
    );
  });
}

// A loaded image replaces the initials, which are hidden, so screen readers
// skip them too.
export const Image: Story = {
  play: async () => {
    await settled('loaded');
    await expect(part('avatar-image')).toBeVisible();
    await expect(part('avatar-fallback')).not.toBeVisible();
    await expect(part('avatar-image')).toHaveAttribute('alt', '');
  },
};

// A broken image, or none, shows the initials instead.
export const BrokenImage: Story = {
  args: { src: broken },
  play: async () => {
    await settled('error');
    await expect(part('avatar-image')).not.toBeVisible();
    await expect(part('avatar-fallback')).toHaveTextContent('AL');
    await expect(part('avatar-fallback')).toBeVisible();
  },
};

export const NoImage: Story = {
  args: { src: undefined },
  play: async () => {
    await expect(part('avatar-fallback')).toBeVisible();
  },
};

// A lazy image still loads: while loading it stays laid out, invisibly,
// since Chrome never starts a lazy load for an image with display: none. A
// served file, as Chrome loads a data URL at once whatever loading says.
export const LazyImage: Story = {
  play: async () => {
    await settled('loaded');
    await expect(part('avatar-fallback')).not.toBeVisible();
  },
  render: () => (
    <Avatar>
      <AvatarImage loading="lazy" src={servedPhoto} />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

// While loading, the invisible image is out of the way: screen readers read
// the initials alone, and the pointer reaches the fallback. Far below the
// fold, a lazy image stays loading; its own URL keeps LazyImage's cached copy
// from settling it at once.
export const LoadingHidden: Story = {
  play: async () => {
    const image = part('avatar-image');
    await expect(image).toHaveAttribute('data-status', 'loading');
    await expect(image).toHaveAttribute('aria-hidden', 'true');
    await expect(getComputedStyle(image).pointerEvents).toBe('none');
  },
  render: () => (
    <div>
      <div className="h-screen" />
      <div className="h-screen" />
      <Avatar>
        <AvatarImage
          alt="Ada Lovelace"
          loading="lazy"
          src={`${servedPhoto}?below-fold`}
        />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    </div>
  ),
};

// Server-rendered images can settle before React hydrates and attaches its
// handlers; the avatar reads where each stands once mounted.
async function hydrated(
  tree: ReactElement,
  root: HTMLElement,
  check: (container: HTMLElement) => Promise<void>,
) {
  const container = document.createElement('div');
  root.append(container);
  container.innerHTML = renderToString(tree);
  const image = part('avatar-image', container);
  if (!(image instanceof HTMLImageElement)) throw new Error('No image');
  await waitFor(async () => {
    await expect(image.complete).toBe(true);
  });
  const react = hydrateRoot(container, tree);
  try {
    await check(container);
  } finally {
    react.unmount();
    container.remove();
  }
}

export const Hydrated: Story = {
  play: async ({ canvasElement }) => {
    await hydrated(<AvatarDemo src={photo} />, canvasElement, async (root) => {
      await settled('loaded', root);
      await expect(part('avatar-image', root)).toBeVisible();
      await expect(part('avatar-fallback', root)).not.toBeVisible();
    });
  },
  render: () => <div />,
};

// srcSet alone is a source.
export const HydratedSrcSet: Story = {
  play: async ({ canvasElement }) => {
    await hydrated(
      <Avatar>
        <AvatarImage srcSet={`${photo} 1x`} />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
      canvasElement,
      async (root) => {
        await settled('loaded', root);
        await expect(part('avatar-fallback', root)).not.toBeVisible();
      },
    );
  },
  render: () => <div />,
};

export const HydratedBroken: Story = {
  play: async ({ canvasElement }) => {
    await hydrated(<AvatarDemo src={broken} />, canvasElement, async (root) => {
      await settled('error', root);
      await expect(part('avatar-fallback', root)).toBeVisible();
    });
  },
  render: () => <div />,
};

// A new src starts over at once, so the initials show until it settles
// rather than the last image. The statuses it passes through are recorded,
// since a fast image can settle before any check runs.
export const SourceChange: Story = {
  play: async ({ canvas }) => {
    await settled('loaded');
    const image = part('avatar-image');
    const statuses: (null | string)[] = [];
    const observer = new MutationObserver(() => {
      statuses.push(image.dataset.status ?? null);
    });
    observer.observe(image, { attributeFilter: ['data-status'] });
    await userEvent.click(canvas.getByRole('button', { name: 'Break' }));
    await settled('error');
    observer.disconnect();
    await expect(statuses).toEqual(['loading', 'error']);
    await expect(part('avatar-fallback')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Fix' }));
    await settled('loaded');
    await expect(part('avatar-fallback')).not.toBeVisible();
  },
  render: function Render() {
    const [src, setSrc] = useState(photo);
    return (
      <div className="flex items-center gap-3">
        <AvatarDemo src={src} />
        <Button onPress={() => setSrc(broken)} size="sm" variant="outline">
          Break
        </Button>
        <Button onPress={() => setSrc(photo)} size="sm" variant="outline">
          Fix
        </Button>
      </div>
    );
  },
};

// Removing the image brings the initials back.
export const RemoveImage: Story = {
  play: async ({ canvas }) => {
    await settled('loaded');
    await userEvent.click(canvas.getByRole('button', { name: 'Remove' }));
    await expect(part('avatar-fallback')).toBeVisible();
  },
  render: function Render() {
    const [src, setSrc] = useState<string | undefined>(photo);
    return (
      <div className="flex items-center gap-3">
        <AvatarDemo src={src} />
        <Button onPress={() => setSrc(undefined)} size="sm" variant="outline">
          Remove
        </Button>
      </div>
    );
  },
};
