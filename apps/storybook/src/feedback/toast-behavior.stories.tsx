import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@oakoss/ui/components/ui/overlays/dialog';
import {
  expect,
  fn,
  screen,
  spyOn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

import { part } from '#/helpers/parts';
import { settled } from '#/overlays/overlay-test';

import { stayedOpen } from '../overlays/dialog-demo';
import {
  Demo,
  demoStore,
  findToast,
  gone,
  messages,
  resetDemoStore,
} from './toast-demo';

const meta = {
  beforeEach: resetDemoStore,
  component: Demo,
  title: 'Feedback/Toast/Behavior',
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

// An action that returns a promise stays pending until it settles, then
// closes the toast.
export const PendingAction: Story = {
  play: async () => {
    const work = Promise.withResolvers<undefined>();
    demoStore.show('Message archived', {
      action: { label: 'Undo', onPress: () => work.promise },
    });
    const toast = await findToast('Message archived');
    const undo = within(toast).getByRole('button', { name: 'Undo' });
    await userEvent.click(undo);
    await waitFor(async () => {
      await expect(undo).toHaveAttribute('data-pending', 'true');
    });
    await expect(toast).toBeInTheDocument();
    work.resolve(undefined);
    await gone('Message archived');
  },
};

// closeOnAction={false} keeps the toast after its action runs.
export const ActionKeepsOpen: Story = {
  play: async () => {
    let presses = 0;
    demoStore.show('Draft restored', {
      action: {
        label: 'Show',
        onPress: () => {
          presses += 1;
        },
      },
      closeOnAction: false,
    });
    const toast = await findToast('Draft restored');
    await userEvent.click(within(toast).getByRole('button', { name: 'Show' }));
    await expect(presses).toBe(1);
    await stayedOpen(toast);
  },
};

// A failing action goes to its onError and leaves the toast open.
export const FailingAction: Story = {
  play: async () => {
    const failure = new Error('Offline');
    const onError = fn<(error: unknown) => void>();
    demoStore.show('Message archived', {
      action: {
        label: 'Undo',
        onError,
        onPress: () => Promise.reject(failure),
      },
    });
    const toast = await findToast('Message archived');
    const undo = within(toast).getByRole('button', { name: 'Undo' });
    await userEvent.click(undo);
    await waitFor(async () => {
      await expect(onError).toHaveBeenCalledWith(failure);
    });
    await expect(onError).toHaveBeenCalledTimes(1);
    await waitFor(async () => {
      await expect(undo).not.toHaveAttribute('data-pending', 'true');
    });
    await stayedOpen(toast);
  },
};

// An action that settles after its toast was replaced by id leaves the
// replacement open.
export const StaleAction: Story = {
  play: async () => {
    const work = Promise.withResolvers<undefined>();
    demoStore.show('Archiving', {
      action: { label: 'Undo', onPress: () => work.promise },
      id: 'archive',
    });
    const toast = await findToast('Archiving');
    await userEvent.click(within(toast).getByRole('button', { name: 'Undo' }));
    demoStore.show('Archived', { duration: Infinity, id: 'archive' });
    const replacement = await findToast('Archived');
    work.resolve(undefined);
    await stayedOpen(replacement);
  },
};

// A replacement's action starts ready, not pending on the old one's work.
export const ReplacedActionReady: Story = {
  play: async () => {
    demoStore.show('Archiving', {
      action: { label: 'Undo', onPress: () => Promise.withResolvers().promise },
      id: 'archive',
    });
    const toast = await findToast('Archiving');
    const undo = within(toast).getByRole('button', { name: 'Undo' });
    await userEvent.click(undo);
    await waitFor(async () => {
      await expect(undo).toHaveAttribute('data-pending', 'true');
    });
    demoStore.show('Archived', {
      action: { label: 'Undo', onPress: () => undefined },
      id: 'archive',
    });
    const replacement = await findToast('Archived');
    await expect(
      within(replacement).getByRole('button', { name: 'Undo' }),
    ).not.toHaveAttribute('data-pending');
  },
};

// A toast shown again under an id whose last toast is still leaving is a new
// toast, announced again.
export const ReshownWhileExiting: Story = {
  play: async () => {
    const key = demoStore.show('Saved', { duration: Infinity, id: 'save' });
    await findToast('Saved');
    await waitFor(async () => {
      await expect(messages('polite')).toEqual(['Saved.']);
    });
    demoStore.close(key);
    demoStore.show('Saved', { duration: Infinity, id: 'save' });
    await waitFor(async () => {
      await expect(messages('polite')).toEqual(['Saved.', 'Saved.']);
    });
    await stayedOpen(await findToast('Saved'));
  },
};

// Escape on the last toast sends focus back where it was.
export const FocusRestores: Story = {
  play: async ({ canvas }) => {
    const save = canvas.getByRole('button', { name: 'Save' });
    await userEvent.click(save);
    const toast = await findToast('Changes saved');
    toast.focus();
    await userEvent.keyboard('{Escape}');
    await gone('Changes saved');
    await expect(save).toHaveFocus();
  },
};

// Timers pause while the page is hidden.
export const HiddenPagePauses: Story = {
  play: async () => {
    const pause = spyOn(demoStore, 'pause');
    const resume = spyOn(demoStore, 'resume');
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
    await expect(pause).toHaveBeenCalledWith('hidden');
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await expect(resume).toHaveBeenCalledWith('hidden');
  },
};

// A region that unmounts while hovered releases its pause.
export const UnmountResumes: Story = {
  play: async () => {
    const key = demoStore.show('Changes saved', { duration: Infinity });
    const toast = await findToast('Changes saved');
    await userEvent.hover(toast);
    const resumeAll = spyOn(demoStore, 'resumeAll');
    demoStore.close(key);
    await gone('Changes saved');
    await expect(resumeAll).toHaveBeenCalled();
  },
};

// The region sits above an open modal and stays in the accessibility tree,
// and pressing a toast's button leaves the modal open.
export const AboveModal: Story = {
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Open editor' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit profile' });
    await settled(dialog);
    demoStore.show('Changes saved', {
      action: { label: 'Undo', onPress: () => undefined },
      closeOnAction: false,
    });
    const toast = await findToast('Changes saved');
    // React Aria's modal makes the rest of the page inert.
    await expect(toast.closest('[inert], [aria-hidden=true]')).toBeNull();
    await expect(
      part('toast-portal').closest('[inert], [aria-hidden=true]'),
    ).toBeNull();
    toast.focus();
    await expect(toast).toHaveFocus();
    const root = getComputedStyle(document.documentElement);
    const region = getComputedStyle(part('toast-viewport'));
    await expect(Number(region.zIndex)).toBeGreaterThan(
      Number(root.getPropertyValue('--z-modal')),
    );
    await userEvent.click(within(toast).getByRole('button', { name: 'Undo' }));
    await stayedOpen(dialog);
  },
  render: (args) => (
    <>
      <DialogTrigger>
        <Button variant="outline">Open editor</Button>
        <Dialog>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
        </Dialog>
      </DialogTrigger>
      <Demo {...args} />
    </>
  ),
};

// top start sits in the top-left corner in a left-to-right page.
export const TopStart: Story = {
  args: { placement: 'top start' },
  play: async () => {
    demoStore.show('Changes saved', { duration: Infinity });
    await settled(await findToast('Changes saved'));
    const box = part('toast-viewport').getBoundingClientRect();
    await expect(box.top).toBe(0);
    await expect(box.left).toBe(0);
  },
};

// end follows the locale: the left edge in Arabic, with React Aria's
// translated close label.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    demoStore.show('تم الحفظ', { duration: Infinity });
    const toast = await findToast('تم الحفظ');
    await settled(toast);
    await expect(part('toast-viewport').getBoundingClientRect().left).toBe(0);
    await expect(
      within(toast).getByRole('button', { name: 'إغلاق' }),
    ).toBeInTheDocument();
  },
};

// Forced colors repaint the panel's fill as the page color, so its border
// keeps the edge.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    demoStore.show('Changes saved', { duration: Infinity }, 'success');
    const toast = await findToast('Changes saved');
    await expect(getComputedStyle(toast).borderTopWidth).toBe('1px');
  },
  tags: ['forced-colors'],
};
