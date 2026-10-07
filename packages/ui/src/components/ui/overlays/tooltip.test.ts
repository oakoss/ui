import { expect, test } from 'vitest';

import type { TooltipProps } from '#/components/ui/overlays/tooltip';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('Tooltip takes its open state from TooltipTrigger', () => {
  const valid: TooltipProps = { children: 'Save', placement: 'top' };
  const controlled: TooltipProps = {
    children: 'Save',
    // @ts-expect-error open state lives on TooltipTrigger, which owns isDisabled
    isOpen: true,
  };
  const initial: TooltipProps = {
    children: 'Save',
    // @ts-expect-error defaultOpen would show a disabled trigger's tooltip
    defaultOpen: true,
  };
  const exiting: TooltipProps = {
    children: 'Save',
    // @ts-expect-error isExiting would keep a closed or disabled tooltip mounted
    isExiting: true,
  };
  const anchored: TooltipProps = {
    children: 'Save',
    // @ts-expect-error TooltipTrigger supplies the trigger element
    triggerRef: { current: null },
  };
  const reported: TooltipProps = {
    children: 'Save',
    // @ts-expect-error TooltipTrigger reports open state
    onOpenChange: () => undefined,
  };
  const entering: TooltipProps = {
    children: 'Save',
    // @ts-expect-error isEntering would animate a tooltip that isn't opening
    isEntering: true,
  };
  expect([
    valid,
    controlled,
    initial,
    exiting,
    anchored,
    reported,
    entering,
  ]).toHaveLength(7);
});
