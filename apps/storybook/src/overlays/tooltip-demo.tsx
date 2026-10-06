import type { ComponentProps } from 'react';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Tooltip,
  TooltipTrigger,
} from '@oakoss/ui/components/ui/overlays/tooltip';
import { expect, screen, waitFor } from 'storybook/test';

export type TooltipDemoProps = { defaultOpen?: boolean; text?: string } & Omit<
  ComponentProps<typeof Tooltip>,
  'children'
>;

// Measured once the enter transition finishes.
export async function settledTooltip() {
  const tooltip = await screen.findByRole('tooltip');
  await waitFor(async () => {
    await expect(tooltip).not.toHaveAttribute('data-entering');
  });
  await Promise.all(tooltip.getAnimations().map((a) => a.finished));
  const trigger = screen.getByRole('button', { name: 'Save' });
  return {
    box: tooltip.getBoundingClientRect(),
    tooltip,
    trigger: trigger.getBoundingClientRect(),
  };
}

export function tooltipArrow() {
  const svg = document.querySelector('[data-slot=tooltip-arrow] svg');
  if (!(svg instanceof SVGElement)) throw new Error('No arrow');
  return getComputedStyle(svg);
}

export function TooltipDemo({
  defaultOpen = false,
  text = 'Save your changes',
  ...props
}: TooltipDemoProps) {
  return (
    <div className="grid min-h-64 place-items-center">
      <TooltipTrigger defaultOpen={defaultOpen}>
        <Button variant="outline">Save</Button>
        <Tooltip {...props}>{text}</Tooltip>
      </TooltipTrigger>
    </div>
  );
}

export function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
