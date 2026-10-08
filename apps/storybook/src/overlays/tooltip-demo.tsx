import type { ComponentProps, ReactNode } from 'react';

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
  Pick<
    ComponentProps<typeof TooltipTrigger>,
    'defaultOpen' | 'delay' | 'onOpenChange'
  >;

// Keeps a trigger off the page's top-left corner, where CI's real pointer
// rests and would hover it as it mounts.
export function Centered({ children }: { children: ReactNode }) {
  return <div className="grid min-h-64 place-items-center">{children}</div>;
}

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
  delay,
  onOpenChange,
  text = 'Save your changes',
  ...props
}: TooltipDemoProps) {
  return (
    <Centered>
      <TooltipTrigger
        defaultOpen={defaultOpen}
        delay={delay}
        onOpenChange={onOpenChange}
      >
        <Button variant="outline">Save</Button>
        <Tooltip {...props}>{text}</Tooltip>
      </TooltipTrigger>
    </Centered>
  );
}
