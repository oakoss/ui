import { expect, test } from 'vitest';

import type { InputOTPProps } from '#/components/ui/inputs/input-otp';

test('slots come from groupSize or children, not both', () => {
  const props: InputOTPProps[] = [{ groupSize: 3 }, { children: 'slots' }];
  // @ts-expect-error a layout and hand-placed slots together
  const both: InputOTPProps = { children: 'slots', groupSize: 3 };
  expect([...props, both]).toHaveLength(3);
});

test('length and characters own the input attributes they set', () => {
  // @ts-expect-error length sets it
  const maxLength: InputOTPProps = { maxLength: 4 };
  // @ts-expect-error characters sets it
  const pattern: InputOTPProps = { pattern: '[0-9]*' };
  // @ts-expect-error characters sets it
  const inputMode: InputOTPProps = { inputMode: 'text' };
  expect([maxLength, pattern, inputMode]).toHaveLength(3);
});
