import type { ComponentProps } from 'react';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Tooltip,
  TooltipTrigger,
} from '@oakoss/ui/components/ui/overlays/tooltip';
import { screen } from 'storybook/test';

import { settled } from './overlay-test';

export type TooltipDemoProps = { text?: string } & Omit<
  ComponentProps<typeof Tooltip>,
  'children'
> &
  Pick<ComponentProps<typeof TooltipTrigger>, 'defaultOpen' | 'onOpenChange'>;

export async function settledTooltip() {
  const tooltip = await screen.findByRole('tooltip');
  await settled(tooltip);
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
  onOpenChange,
  text = 'Save your changes',
  ...props
}: TooltipDemoProps) {
  return (
    <div className="grid min-h-64 place-items-center">
      <TooltipTrigger defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <Button variant="outline">Save</Button>
        <Tooltip {...props}>{text}</Tooltip>
      </TooltipTrigger>
    </div>
  );
}
