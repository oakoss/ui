import { clampChroma, differenceEuclidean } from 'culori';
import { describe, expect, it } from 'vitest';

import { type Color, oklch } from '#/color';
import { tailwindGrays } from '#/families/tailwind-grays';
import { tailwindScales } from '#/families/tailwind-scales';
import { type CoreStep, type SeededScale, steps } from '#/scale';
import { chromaCurve, expandSeeded, lightnessCurve } from '#/seeded';

const oklab = differenceEuclidean('oklab');

const accents = Object.entries(tailwindScales).filter(
  ([name]) => !Object.hasOwn(tailwindGrays, name),
);

const chromatic = [
  ['vivid red', oklch(60, 0.24, 27)],
  ['Nord frost', oklch(78.24, 0.0617, 214.9)],
  ['near-white tint', oklch(97.5, 0.02, 250)],
  ['near-black', oklch(27, 0.05, 250)],
] as const;

const seeds = [...chromatic, ['gray', oklch(55, 0, null)]] as const;

function mean(values: readonly number[]): number {
  let sum = 0;
  for (const value of values) sum += value;
  return sum / values.length;
}

function seeded(seed: Color, overrides?: SeededScale['overrides']) {
  return expandSeeded<string, string>({ kind: 'seeded', overrides, seed });
}

function toCulori(color: Color) {
  const [l, c, h] = color.components;
  return { c, h: h ?? undefined, l, mode: 'oklch' as const };
}

describe('the Tailwind curves', () => {
  it('get darker and peak in chroma mid-scale', () => {
    const lightness = steps.map((step) => lightnessCurve[step]);
    expect(lightness).toEqual(lightness.toSorted((a, b) => b - a));
    expect(chromaCurve[500]).toBeGreaterThan(chromaCurve[50]);
    expect(chromaCurve[500]).toBeGreaterThan(chromaCurve[950]);
  });

  it('is relative to each scale peak', () => {
    const chroma = steps.map((step) => chromaCurve[step]);
    expect(Math.max(...chroma)).toBeLessThanOrEqual(1);
    expect(Math.max(...chroma)).toBeGreaterThan(0.9);
  });
});

describe('expandSeeded: the seed', () => {
  it.each(seeds)('keeps the %s seed exactly at its nearest step', (_, seed) => {
    const { anchor, steps: scaleSteps } = seeded(seed);
    const distance = (step: CoreStep) =>
      Math.abs(lightnessCurve[step] - seed.components[0]);
    const [nearest] = steps.toSorted((a, b) => distance(a) - distance(b));
    expect(anchor).toEqual({ dark: nearest, light: nearest });
    expect(scaleSteps[anchor.light]).toBe(seed);
  });

  it('keeps the seed chroma relative to the curve', () => {
    const scale = seeded(oklch(60, 0.12, 150));
    expect(scale.steps[400].components[1]).toBeCloseTo(
      (0.12 / chromaCurve[600]) * chromaCurve[400],
      6,
    );
  });

  it('gives a gray seed zero chroma everywhere', () => {
    const scale = seeded(oklch(55, 0, null));
    expect(steps.map((step) => scale.steps[step].components[1])).toEqual(
      steps.map(() => 0),
    );
  });
});

describe('expandSeeded: the generated steps', () => {
  it.each(seeds)('makes the %s scale darker step by step', (_, seed) => {
    const scale = seeded(seed);
    const lightness = steps.map((step) => scale.steps[step].components[0]);
    expect(lightness).toEqual(lightness.toSorted((a, b) => b - a));
  });

  // The seed itself stays exact even outside P3, as the near-white tint is.
  it.each(chromatic)('keeps the %s hue and generates in P3', (_, seed) => {
    const scale = seeded(seed);
    const generated = steps.filter((step) => step !== scale.anchor.light);
    for (const step of generated) {
      const color = scale.steps[step];
      expect(color.components[2]).toBe(seed.components[2]);
      const { c } = clampChroma(toCulori(color), 'oklch', 'p3');
      expect(c).toBeCloseTo(color.components[1], 6);
    }
  });

  it('clamps to P3, not sRGB', () => {
    const scale = seeded(oklch(60, 0.24, 27));
    const wider = steps.filter((step) => {
      const color = scale.steps[step];
      const { c } = clampChroma(toCulori(color), 'oklch', 'rgb');
      return color.components[1] > c + 0.001;
    });
    expect(wider.length).toBeGreaterThan(0);
  });

  it('lets overrides win, including steps 25 and 1000', () => {
    const pinned = oklch(50, 0.1, 10);
    const scale = seeded(oklch(60, 0.12, 150), {
      1000: pinned,
      25: pinned,
      600: pinned,
    });
    expect([scale.steps[25], scale.steps[600], scale.steps[1000]]).toEqual([
      pinned,
      pinned,
      pinned,
    ]);
  });

  it('generates no step 25 or 1000 on its own', () => {
    const scale = seeded(oklch(60, 0.12, 150));
    expect(Object.keys(scale.steps).map(Number)).toEqual([...steps]);
  });
});

describe('expandSeeded: fidelity', () => {
  // 0004 measured 0.03-0.12 mean OKLab distance on real palettes.
  it('stays close to each Tailwind accent when seeded from its 500', () => {
    const distances = accents.map(([, scale]) => {
      const expanded = seeded(scale.steps[500]);
      return mean(
        steps.map((step) =>
          oklab(toCulori(expanded.steps[step]), toCulori(scale.steps[step])),
        ),
      );
    });
    expect(mean(distances)).toBeLessThan(0.04);
    expect(Math.max(...distances)).toBeLessThan(0.07);
  });
});
