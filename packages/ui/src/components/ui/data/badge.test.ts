import { expect, test } from 'vitest';

import { type BadgeProps, badgeStyles } from '#/components/ui/data/badge';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('only badgeStyles makes a badge interactive', () => {
  const valid: BadgeProps[] = [{}, { intent: 'info', variant: 'soft' }];
  // @ts-expect-error a plain badge has no hover, press or focus styles
  const interactive: BadgeProps = { interactive: true };
  // @ts-expect-error a pointer target belongs on a link or button badge
  const target: BadgeProps = { targetSize: true };
  const styles = [
    badgeStyles({ targetSize: false }),
    // @ts-expect-error badgeStyles is always interactive
    badgeStyles({ interactive: false }),
  ];
  expect([...valid, interactive, target, ...styles]).toHaveLength(6);
});
