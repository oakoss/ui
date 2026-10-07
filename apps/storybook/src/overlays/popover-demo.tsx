import type { ComponentProps } from 'react';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Popover,
  PopoverBody,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@oakoss/ui/components/ui/overlays/popover';
import { screen } from 'storybook/test';

import { settled } from './overlay-test';

export type PopoverDemoProps = {
  defaultOpen?: boolean;
  descriptionId?: string;
  rows?: number;
  withBody?: boolean;
} & Omit<ComponentProps<typeof Popover>, 'children'>;

// The trigger's text differs from the title, so a passing name check means the
// title names the popover, not DialogTrigger's fallback to the trigger.
export function PopoverDemo({
  defaultOpen = false,
  descriptionId,
  rows = 0,
  withBody = true,
  ...props
}: PopoverDemoProps) {
  const content = Array.from({ length: rows }, (_, index) => (
    <p key={index}>Row {index + 1}</p>
  ));
  return (
    <div className="grid min-h-96 place-items-center">
      <PopoverTrigger defaultOpen={defaultOpen}>
        <Button variant="outline">Open settings</Button>
        <Popover {...props}>
          <PopoverHeader>
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription id={descriptionId}>
              Set the layer’s size.
            </PopoverDescription>
          </PopoverHeader>
          {withBody && rows > 0 ? <PopoverBody>{content}</PopoverBody> : null}
          {!withBody && rows > 0 ? (
            <>
              {content}
              <Button>Apply</Button>
            </>
          ) : null}
        </Popover>
      </PopoverTrigger>
    </div>
  );
}

export async function settledPopover() {
  const dialog = await screen.findByRole('dialog', { name: 'Dimensions' });
  const panel = dialog.closest('[data-slot=popover-content]');
  if (!(panel instanceof HTMLElement)) throw new Error('No panel');
  await settled(panel);
  const trigger = screen.getByRole('button', { name: 'Open settings' });
  return {
    box: panel.getBoundingClientRect(),
    dialog,
    panel,
    trigger: trigger.getBoundingClientRect(),
  };
}
