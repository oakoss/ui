import type { ComponentProps } from 'react';

import { expect, test } from 'vitest';

import type { AlertProps } from '#/components/ui/feedback/alert';

const divProps: ComponentProps<'div'> = {};

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('Alert takes only the live roles', () => {
  const valid: AlertProps[] = [{}, { role: 'alert' }, { role: 'status' }];
  // @ts-expect-error an alert dialog is AlertDialog, which moves focus
  const dialog: AlertProps = { role: 'alertdialog' };
  // @ts-expect-error a callout that needs a landmark is a section of the page
  const region: AlertProps = { role: 'region' };
  // @ts-expect-error a div's props carry any role
  const spread: AlertProps = divProps;
  expect([...valid, dialog, region, spread]).toHaveLength(6);
});
