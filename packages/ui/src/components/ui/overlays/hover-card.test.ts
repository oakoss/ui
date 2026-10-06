import { expect, test } from 'vitest';

import type { HoverCardProps } from '#/components/ui/overlays/hover-card';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('HoverCard requires a name and stays non-modal', () => {
  const valid: HoverCardProps[] = [
    { 'aria-label': 'Ada Lovelace', children: 'Bio' },
    { 'aria-labelledby': 'ada-name', children: 'Bio' },
  ];
  // @ts-expect-error the card is a dialog, which needs a name
  const unnamed: HoverCardProps = { children: 'Bio' };
  const modal: HoverCardProps = {
    'aria-label': 'Ada Lovelace',
    children: 'Bio',
    // @ts-expect-error PreviewTrigger sets the trigger and modality
    isNonModal: false,
  };
  const controlled: HoverCardProps = {
    'aria-label': 'Ada Lovelace',
    children: 'Bio',
    // @ts-expect-error open state lives on HoverCardTrigger, with the trigger
    isOpen: true,
  };
  const detached: HoverCardProps = {
    'aria-label': 'Ada Lovelace',
    children: 'Bio',
    // @ts-expect-error slot={null} would detach the card from its trigger
    slot: null,
  };
  const exiting: HoverCardProps = {
    'aria-label': 'Ada Lovelace',
    children: 'Bio',
    // @ts-expect-error isExiting would keep a closed or disabled card mounted
    isExiting: true,
  };
  const anchored: HoverCardProps = {
    'aria-label': 'Ada Lovelace',
    children: 'Bio',
    // @ts-expect-error PreviewTrigger supplies the trigger element
    triggerRef: { current: null },
  };
  expect([
    ...valid,
    unnamed,
    modal,
    controlled,
    detached,
    exiting,
    anchored,
  ]).toHaveLength(8);
});
