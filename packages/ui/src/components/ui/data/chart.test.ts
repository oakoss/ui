import { expect, test, vi } from 'vitest';

import type { ChartContainerProps } from '#/components/ui/data/chart';
import type { ChartLegendProps } from '#/components/ui/data/chart-legend';

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

test('hidden series are held by the container or controlled with a handler', () => {
  const onHiddenSeriesChange = vi.fn<(hidden: Set<string>) => void>();
  const props: ChartContainerProps[] = [
    { ...caption, defaultHiddenSeries: ['mobile'] },
    { ...caption, hiddenSeries: new Set(['mobile']), onHiddenSeriesChange },
    // @ts-expect-error controlled series need the handler, or toggles do nothing
    { ...caption, hiddenSeries: ['mobile'] },
    // @ts-expect-error a default is ignored once the series are controlled
    {
      ...caption,
      defaultHiddenSeries: ['desktop'],
      hiddenSeries: ['mobile'],
      onHiddenSeriesChange,
    },
    // @ts-expect-error a string would hide its characters
    { ...caption, defaultHiddenSeries: 'mobile' },
  ];
  expect(props).toHaveLength(5);
});

test('a static legend has no toolbar to name', () => {
  const props: ChartLegendProps[] = [
    { isStatic: true },
    { label: 'Devices' },
    // @ts-expect-error the label would name nothing
    { isStatic: true, label: 'Devices' },
  ];
  expect(props).toHaveLength(3);
});
