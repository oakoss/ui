import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@oakoss/ui/components/ui/overlays/dialog';
import { expect, screen, userEvent } from 'storybook/test';

import { Demo, type DemoProps, dialogParts } from './dialog-demo';
import { settled } from './overlay-test';

const meta = {
  args: { defaultOpen: true },
  render: (args) => <Demo {...args} />,
  title: 'Overlays/Dialog/Sizes',
} satisfies Meta<DemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// Measured after the enter transition, which scales the panel from 95%.
async function contentBox() {
  const { content } = dialogParts(await screen.findByRole('dialog'));
  await settled(content);
  return { box: content.getBoundingClientRect(), content };
}

// From `sm` up, each size caps the panel's width.
export const Small: Story = {
  args: { size: 'sm' },
  play: async () => {
    const { box, content } = await contentBox();
    await expect(box.width).toBe(384);
    await expect(content).toHaveAttribute('data-size', 'sm');
  },
};

// From `sm` up the panel is centered, with every corner rounded.
export const Medium: Story = {
  play: async () => {
    const { box, content } = await contentBox();
    await expect(box.width).toBe(448);
    await expect(content).toHaveAttribute('data-size', 'md');
    await expect(
      Math.abs(box.top - (window.innerHeight - box.height) / 2),
    ).toBeLessThanOrEqual(1);
    await expect(getComputedStyle(content).borderBottomLeftRadius).not.toBe(
      '0px',
    );
  },
};

export const Large: Story = {
  args: { size: 'lg' },
  play: async () => {
    const { box } = await contentBox();
    await expect(box.width).toBe(672);
  },
};

export const Full: Story = {
  args: { size: 'full' },
  play: async () => {
    const { box, content } = await contentBox();
    await expect(box.width).toBe(window.innerWidth);
    await expect(box.height).toBe(window.innerHeight);
    await expect(getComputedStyle(content).borderTopLeftRadius).toBe('0px');
    const { overlay } = dialogParts(await screen.findByRole('dialog'));
    await expect(overlay).toHaveAttribute('data-size', 'full');
  },
};

// The overlay follows React Aria's --visual-viewport-height, which shrinks when
// a phone's on-screen keyboard opens.
export const VisualViewportHeight: Story = {
  play: async () => {
    const { overlay } = dialogParts(await screen.findByRole('dialog'));
    overlay.style.setProperty('--visual-viewport-height', '400px');
    await expect(overlay.getBoundingClientRect().height).toBe(400);
  },
};

// A form around the body and footer takes `contents`, so the body still
// scrolls between them.
export const FormWrappedBody: Story = {
  play: async () => {
    const dialog = await screen.findByRole('dialog', { name: 'Terms' });
    const body = dialog.querySelector('[data-slot=dialog-body]');
    if (!(body instanceof HTMLElement)) throw new Error('No body');
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    await expect(dialogParts(dialog).content.scrollHeight).toBe(
      dialogParts(dialog).content.clientHeight,
    );
  },
  render: () => (
    <Dialog defaultOpen>
      <DialogHeader>
        <DialogTitle>Terms</DialogTitle>
      </DialogHeader>
      <form className="contents">
        <DialogBody>
          {Array.from({ length: 60 }, (_, index) => (
            <p key={index}>Clause {index + 1}.</p>
          ))}
        </DialogBody>
        <DialogFooter closeLabel="Done" showCloseButton />
      </form>
    </Dialog>
  ),
};

// The body scrolls between the header and footer, which stay in view.
export const ScrollingBody: Story = {
  play: async () => {
    const dialog = await screen.findByRole('dialog', { name: 'Terms' });
    const heading = screen.getByRole('heading', { name: 'Terms' });
    const done = screen.getByRole('button', { name: 'Done' });
    const body = dialog.querySelector('[data-slot=dialog-body]');
    if (!(body instanceof HTMLElement)) throw new Error('No body');
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    body.scrollTop = body.scrollHeight;
    for (const element of [heading, done]) {
      const box = element.getBoundingClientRect();
      await expect(box.top).toBeGreaterThanOrEqual(0);
      await expect(box.bottom).toBeLessThanOrEqual(window.innerHeight);
    }
    await expect(dialogParts(dialog).content.scrollTop).toBe(0);
    // Focusable so the keyboard can scroll it, with the outline drawn inside.
    await userEvent.tab();
    await expect(body).toHaveFocus();
    const style = getComputedStyle(body);
    await expect(style.outlineStyle).toBe('solid');
    await expect(style.outlineOffset).toBe('-3px');
  },
  render: () => (
    <Dialog defaultOpen>
      <DialogHeader>
        <DialogTitle>Terms</DialogTitle>
      </DialogHeader>
      <DialogBody>
        {Array.from({ length: 60 }, (_, index) => (
          <p key={index}>Clause {index + 1}.</p>
        ))}
      </DialogBody>
      <DialogFooter closeLabel="Done" showCloseButton />
    </Dialog>
  ),
};
