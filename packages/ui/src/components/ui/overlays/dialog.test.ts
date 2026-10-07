import { expect, test } from 'vitest';

import type {
  DialogCloseProps,
  DialogContentProps,
} from '#/components/ui/overlays/dialog';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('DialogClose keeps the close slot and Button naming rules', () => {
  const valid: DialogCloseProps[] = [
    {},
    { variant: 'solid' },
    { 'aria-label': 'Close', size: 'icon-sm' },
  ];
  // @ts-expect-error the close slot is fixed
  const slotted: DialogCloseProps = { slot: 'other' };
  // @ts-expect-error icon sizes still need an accessible name
  const unnamed: DialogCloseProps = { size: 'icon' };
  expect([...valid, slotted, unnamed]).toHaveLength(5);
});

test('DialogContent leaves open state and dismissal to its overlay', () => {
  const valid: DialogContentProps = { children: 'Body', 'data-slot': 'sheet' };
  // @ts-expect-error the overlay owns open state
  const open: DialogContentProps = { children: 'Body', isOpen: true };
  const dismissable: DialogContentProps = {
    children: 'Body',
    // @ts-expect-error the overlay owns dismissal
    isDismissable: false,
  };
  expect([valid, open, dismissable]).toHaveLength(3);
});
