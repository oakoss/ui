import type { ComponentProps } from 'react';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@oakoss/ui/components/ui/overlays/sheet';
import { expect, screen, waitFor } from 'storybook/test';

export type SheetDemoProps = {
  defaultOpen?: boolean;
  rows?: number;
  withBody?: boolean;
} & Omit<ComponentProps<typeof Sheet>, 'children'>;

type Edge = 'bottom' | 'left' | 'right' | 'top';

export function SheetDemo({
  defaultOpen = false,
  rows = 40,
  withBody = true,
  ...props
}: SheetDemoProps) {
  const options = Array.from({ length: rows }, (_, index) => (
    <p key={index}>Option {index + 1}</p>
  ));
  return (
    <SheetTrigger defaultOpen={defaultOpen}>
      <Button variant="outline">Open filters</Button>
      <Sheet {...props}>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow the results.</SheetDescription>
        </SheetHeader>
        {withBody ? <SheetBody>{options}</SheetBody> : options}
        <SheetFooter>
          <SheetClose>Done</SheetClose>
        </SheetFooter>
      </Sheet>
    </SheetTrigger>
  );
}

// The border on the edge itself, then the inner one facing the page.
const borders = {
  bottom: ['borderBottomColor', 'borderTopColor'],
  left: ['borderLeftColor', 'borderRightColor'],
  right: ['borderRightColor', 'borderLeftColor'],
  top: ['borderTopColor', 'borderBottomColor'],
} as const;

// The panel sits on `edge`, slides in from and out to it, and borders the side
// facing the page.
export async function expectEdge(edge: Edge) {
  const { box, panel } = await settledPanel();
  const { innerHeight, innerWidth } = globalThis;
  const sits = {
    bottom: box.bottom,
    left: box.left,
    right: box.right,
    top: box.top,
  };
  const target = { bottom: innerHeight, left: 0, right: innerWidth, top: 0 };
  await expect(Math.round(sits[edge])).toBe(target[edge]);

  const isOffscreen = (from: DOMRect) =>
    ({
      bottom: from.top >= innerHeight,
      left: from.right <= 0,
      right: from.left >= innerWidth,
      top: from.bottom <= 0,
    })[edge];
  await expect(isOffscreen(await stateBox(panel, 'entering'))).toBe(true);
  await expect(isOffscreen(await stateBox(panel, 'exiting'))).toBe(true);

  // Forced colors repaint every border, transparent ones included.
  if (!matchMedia('(forced-colors: active)').matches) {
    const style = getComputedStyle(panel);
    const [outer, inner] = borders[edge];
    await expect(style[inner]).not.toBe('rgba(0, 0, 0, 0)');
    await expect(style[outer]).toBe('rgba(0, 0, 0, 0)');
  }
  return { box, panel };
}

export function px(value: string) {
  return Number(value.replace('px', ''));
}

// Measured once the slide-in finishes.
export async function settledPanel() {
  const dialog = await screen.findByRole('dialog', { name: 'Filters' });
  const panel = dialog.closest('[data-slot=sheet-content]');
  const overlay = dialog.closest('[data-slot=dialog-overlay]');
  if (!(panel instanceof HTMLElement) || !(overlay instanceof HTMLElement))
    throw new Error('No panel');
  await waitFor(async () => {
    await expect(panel).not.toHaveAttribute('data-entering');
  });
  await Promise.all(panel.getAnimations().map((a) => a.finished));
  return { box: panel.getBoundingClientRect(), dialog, overlay, panel };
}

// Where the panel sits while entering or exiting, read by setting React Aria's
// state attribute once the real slide-in has finished.
async function stateBox(panel: HTMLElement, state: 'entering' | 'exiting') {
  panel.toggleAttribute(`data-${state}`, true);
  await Promise.all(panel.getAnimations().map((a) => a.finished));
  const box = panel.getBoundingClientRect();
  panel.toggleAttribute(`data-${state}`, false);
  await Promise.all(panel.getAnimations().map((a) => a.finished));
  return box;
}
