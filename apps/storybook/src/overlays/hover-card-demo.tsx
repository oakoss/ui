import type { ComponentProps } from 'react';

import {
  HoverCard,
  HoverCardTrigger,
} from '@oakoss/ui/components/ui/overlays/hover-card';
import { Link } from 'react-aria-components';
import { screen } from 'storybook/test';

import { settled, slowTimeout } from './overlay-test';

export type HoverCardDemoProps = {
  defaultOpen?: boolean;
  trigger?: Omit<ComponentProps<typeof HoverCardTrigger>, 'children'>;
} & Partial<Omit<ComponentProps<typeof HoverCard>, 'children'>>;

export function HoverCardDemo({
  defaultOpen = false,
  trigger,
  ...props
}: HoverCardDemoProps) {
  return (
    <div className="grid min-h-80 place-items-center">
      <HoverCardTrigger defaultOpen={defaultOpen} {...trigger}>
        <Link className="underline underline-offset-3" href="#ada">
          @ada
        </Link>
        <HoverCard aria-label="Ada Lovelace" {...props}>
          <p className="font-medium">Ada Lovelace</p>
          <p className="text-muted-foreground">Wrote the first program.</p>
          <Link className="underline underline-offset-3" href="#follow">
            Follow
          </Link>
        </HoverCard>
      </HoverCardTrigger>
    </div>
  );
}

export async function settledCard() {
  const card = await screen.findByRole(
    'dialog',
    { name: 'Ada Lovelace' },
    { timeout: slowTimeout },
  );
  await settled(card);
  const trigger = screen.getByRole('link', { name: '@ada' });
  return {
    box: card.getBoundingClientRect(),
    card,
    trigger,
    triggerBox: trigger.getBoundingClientRect(),
  };
}
