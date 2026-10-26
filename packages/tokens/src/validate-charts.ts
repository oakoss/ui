import type { Family, Palette } from '#/family';

import { chartRoles } from '#/roles';
import { hasScaleStep } from '#/scale';
import { declaredIntent, hasScale } from '#/validate-lookup';

export type ScaleError = [scale: string, error: string];

export function chartErrors(family: Family): string[] {
  const { charts } = family;
  // The tuple type fixes the count; untyped data doesn't.
  const count: number =
    charts.kind === 'ramp' ? charts.steps.length : charts.series.length;
  if (count !== chartRoles.length) {
    return [`charts need ${chartRoles.length} entries, not ${count}`];
  }
  if (charts.kind === 'ramp' && charts.source.intent !== undefined) {
    return declaredIntent(family, charts.source.intent) === undefined
      ? [`chart intent "${charts.source.intent}" doesn't exist`]
      : [];
  }
  if (charts.kind === 'ramp') {
    const { hue } = charts.source;
    return hue === undefined || hasScale(family.palette, hue)
      ? []
      : [`chart hue "${hue}" has no scale`];
  }
  // Array.from visits holes, which untyped data can leave.
  const shapeErrors = Array.from(charts.series, (series, index) =>
    seriesShapeErrors(series, index),
  ).flat();
  if (shapeErrors.length > 0) return shapeErrors;
  return charts.series
    .filter(({ hue }) => !hasScale(family.palette, hue))
    .map(({ hue }) => `chart hue "${hue}" has no scale`);
}

// Steps a chart reads must exist in every scale it can come from.
export function chartStepErrors(
  family: Family,
  palette: Palette<string, string>,
): ScaleError[] {
  const { charts } = family;
  const reads =
    charts.kind === 'categorical'
      ? Array.from(charts.series, (series, index) =>
          // chartErrors reports a series in the wrong shape.
          seriesShapeErrors(series, index).length > 0
            ? []
            : [
                {
                  hues: [series.hue],
                  steps: [series.steps.dark, series.steps.light],
                },
              ],
        ).flat()
      : [
          {
            hues:
              charts.source.intent === undefined
                ? [charts.source.hue]
                : (declaredIntent(family, charts.source.intent)?.choices ?? []),
            steps: charts.steps,
          },
        ];
  return reads.flatMap(({ hues, steps }) =>
    hues.flatMap((hue) => {
      const scale = Object.hasOwn(palette.scales, hue)
        ? palette.scales[hue]
        : undefined;
      if (scale === undefined) return [];
      return steps
        .filter((step) => !hasScaleStep(scale, step))
        .map((step): ScaleError => [
          hue,
          `chart step ${step} is missing from scale "${hue}"`,
        ]);
    }),
  );
}

// Untyped data can leave out a series, its hue or a polarity's step.
function seriesShapeErrors(series: unknown, index: number): string[] {
  const label = `chart series ${index + 1}`;
  if (typeof series !== 'object' || series === null) {
    return [`${label} is missing`];
  }
  if (!('hue' in series) || typeof series.hue !== 'string') {
    return [`${label} has no hue`];
  }
  const steps = 'steps' in series ? series.steps : undefined;
  return (['dark', 'light'] as const)
    .filter(
      (polarity) =>
        typeof steps !== 'object' ||
        steps === null ||
        !Object.hasOwn(steps, polarity) ||
        typeof Reflect.get(steps, polarity) !== 'number',
    )
    .map((polarity) => `${label} has no ${polarity} step`);
}
