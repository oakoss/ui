import { expect, test } from 'vitest';

import type { ChartContainerProps } from '#/components/ui/data/chart';

const caption = {
  config: {},
  description: 'Visitors by month.',
  title: 'Visitors',
};

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('the caption is the only name a chart takes', () => {
  const props: ChartContainerProps[] = [
    { ...caption, id: 'visitors' },
    // @ts-expect-error the caption's title names the figure
    { ...caption, 'aria-labelledby': '' },
    // @ts-expect-error the caption's description describes it
    { ...caption, 'aria-describedby': '' },
    // @ts-expect-error a label would sit unused under the caption
    { ...caption, 'aria-label': 'Chart' },
  ];
  expect(props).toHaveLength(4);
});
