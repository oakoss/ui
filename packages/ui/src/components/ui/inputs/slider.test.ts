import { expect, test } from 'vitest';

import type { SliderProps } from '#/components/ui/inputs/slider';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('a range names each thumb, in either form', () => {
  const valid: SliderProps<number[]>[] = [
    { defaultValue: [20, 80], thumbLabels: ['Minimum', 'Maximum'] },
    {
      children: 'Custom',
      defaultValue: [20, 80],
      thumbLabels: ['Minimum', 'Maximum'],
    },
  ];
  // @ts-expect-error a range's thumbs need their own names
  const unnamed: SliderProps<number[]> = { defaultValue: [20, 80] };
  // @ts-expect-error a composed range needs them too
  const composed: SliderProps<number[]> = { children: 'Custom' };
  expect([...valid, unnamed, composed]).toHaveLength(4);
});

test('a value that may be a range needs the names', () => {
  // @ts-expect-error a value typed number | number[] may hold a range
  const widened: SliderProps<number | number[]> = { defaultValue: [20, 80] };
  expect(widened).toBeDefined();
});

test('a single thumb takes the slider label alone', () => {
  const valid: SliderProps[] = [{}, { defaultValue: 40, label: 'Volume' }];
  // @ts-expect-error one thumb is named by the label
  const labelled: SliderProps = { thumbLabels: ['Volume'] };
  expect([...valid, labelled]).toHaveLength(3);
});

test('children and the layout props are exclusive', () => {
  const mixed: SliderProps[] = [
    // @ts-expect-error children replace the layout
    { children: 'Custom', label: 'Volume' },
    // @ts-expect-error children replace the layout
    { children: 'Custom', description: 'Shown below' },
  ];
  // @ts-expect-error null children would render no track
  const empty: SliderProps = { children: null };
  expect([...mixed, empty]).toHaveLength(3);
});
