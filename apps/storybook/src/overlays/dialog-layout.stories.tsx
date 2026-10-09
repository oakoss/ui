import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@oakoss/ui/components/ui/overlays/dialog';
import { expect, screen } from 'storybook/test';

import {
  closePosition,
  Demo,
  type DemoProps,
  dialogParts,
} from './dialog-demo';
import { settled } from './overlay-test';

const meta = {
  args: { defaultOpen: true },
  render: (args) => <Demo {...args} />,
  title: 'Overlays/Dialog/Layout',
} satisfies Meta<DemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// Open on render so axe checks the dialog in every theme. The panel and
// overlay fade on React Aria's entering and exiting states.
export const Open: Story = {
  play: async () => {
    const dialog = await screen.findByRole('dialog');
    const { content, overlay } = dialogParts(dialog);
    for (const part of [content, overlay]) {
      const style = getComputedStyle(part);
      await expect(style.transitionDuration).toBe('0.1s');
      await expect(style.transitionProperty).toMatch(/opacity|all/u);
    }
    await settled(content);
    await expect(getComputedStyle(content).opacity).toBe('1');
    await expect(getComputedStyle(overlay).zIndex).toBe('1300');
    const close = closePosition(dialog);
    await expect(close).toMatchObject({ left: false, right: true, top: true });
  },
};

export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    const close = closePosition(await screen.findByRole('dialog'));
    await expect(close).toMatchObject({ left: true, right: false, top: true });
  },
};

// A dialog taller than the viewport scrolls inside the panel, so its title and
// actions stay reachable while React Aria locks the page's scroll.
export const TallContent: Story = {
  play: async () => {
    const dialog = await screen.findByRole('dialog', { name: 'Terms' });
    const done = screen.getByRole('button', { name: 'Done' });
    done.scrollIntoView();
    const box = done.getBoundingClientRect();
    await expect(box.bottom).toBeLessThanOrEqual(window.innerHeight);
    await expect(box.top).toBeGreaterThanOrEqual(0);
    await expect(
      dialogParts(dialog).content.getBoundingClientRect().height,
    ).toBeLessThanOrEqual(window.innerHeight);
  },
  render: () => (
    <Dialog defaultOpen>
      <DialogTitle>Terms</DialogTitle>
      {Array.from({ length: 60 }, (_, index) => (
        <p key={index}>Clause {index + 1}.</p>
      ))}
      <DialogFooter closeLabel="Done" showCloseButton />
    </Dialog>
  ),
};

// A link in the description is underlined, even nested in other text, so it
// doesn't rely on color.
export const DescriptionLinks: Story = {
  play: async () => {
    await screen.findByRole('dialog', { name: 'Delete project' });
    for (const name of ['Learn more', 'backups']) {
      await expect(
        getComputedStyle(screen.getByRole('link', { name })).textDecorationLine,
      ).toBe('underline');
    }
  },
  render: () => (
    <Dialog defaultOpen>
      <DialogTitle>Delete project</DialogTitle>
      <DialogDescription>
        <a href="#learn">Learn more</a> about{' '}
        <strong>
          <a href="#backups">backups</a>
        </strong>
        .
      </DialogDescription>
    </Dialog>
  ),
};

export const ClassName: Story = {
  args: { className: 'p-2' },
  play: async () => {
    const { content } = dialogParts(await screen.findByRole('dialog'));
    await expect(getComputedStyle(content).paddingTop).toBe('8px');
  },
};

// The utilities behind these values appear only in packages/ui, so this fails
// if Tailwind stops scanning the package. p-panel is used only by the content.
export const CssCheck: Story = {
  play: async () => {
    const { content } = dialogParts(await screen.findByRole('dialog'));
    await expect(getComputedStyle(content).paddingTop).toBe('24px');
  },
};

// Windows High Contrast drops the shadow and ring, so the edge is a transparent
// border it repaints in a system color.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const { content } = dialogParts(await screen.findByRole('dialog'));
    const style = getComputedStyle(content);
    await expect(style.borderTopWidth).toBe('1px');
    await expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
  },
  tags: ['forced-colors'],
};
