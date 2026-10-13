import { clampChroma } from 'culori';

import type { Color } from '#/color';

import { tailwindGrays } from '#/families/tailwind-grays';
import { tailwindScales } from '#/families/tailwind-scales';
import {
  type AuthoredScale,
  type CoreStep,
  type SeededScale,
  steps,
} from '#/scale';

type Curve = Readonly<Record<CoreStep, number>>;

// Tailwind's chromatic scales; gray chroma is near zero, so it has no
// relative chroma to learn from.
const accents = Object.entries(tailwindScales)
  .filter(([name]) => !Object.hasOwn(tailwindGrays, name))
  .map(([, scale]) => scale);

// Tailwind's mean lightness per step across its chromatic scales.
export const lightnessCurve: Curve = perStep((step) =>
  mean(accents.map((scale) => lightnessOf(scale.steps[step]))),
);

/**
Tailwind's mean chroma per step relative to each scale's peak, so a seed
keeps its own chroma at its step and follows Tailwind's shape elsewhere.
*/
export const chromaCurve: Curve = perStep((step) =>
  mean(
    accents.map((scale) => {
      const peak = Math.max(
        ...steps.map((each) => chromaOf(scale.steps[each])),
      );
      return chromaOf(scale.steps[step]) / peak;
    }),
  ),
);

/**
A seeded scale as an authored one (note 0004, generator b). The seed sits
unchanged at the step nearest its lightness, which is also where the
role-step rule starts in both modes; every other step takes Tailwind's mean
lightness and the seed's relative chroma, clamped to the P3 gamut, at the
seed's hue. Overrides win, and are the only source of steps 25 and 1000.
*/
export function expandSeeded<Hue extends string, Neutral extends string>(
  scale: SeededScale<Hue, Neutral>,
): AuthoredScale<Hue, Neutral> {
  const { overrides, seed, ...rest } = scale;
  const seedStep = nearestStep(lightnessOf(seed));
  const peak = chromaOf(seed) / chromaCurve[seedStep];
  const hue = seed.components[2];
  const generated = perStep((step) =>
    step === seedStep
      ? seed
      : inP3(lightnessCurve[step], peak * chromaCurve[step], hue),
  );
  return {
    ...rest,
    anchor: { dark: seedStep, light: seedStep },
    kind: 'authored',
    steps: { ...generated, ...definedOverrides(overrides) },
  };
}

function chromaOf(color: Color): number {
  return color.components[1];
}

// The types allow an explicit `undefined`; treat it as "not overridden".
function definedOverrides(
  overrides: SeededScale['overrides'],
): Partial<Record<number, Color>> {
  return Object.fromEntries(
    Object.entries(overrides ?? {}).filter(
      ([, color]: [string, Color | undefined]) => color !== undefined,
    ),
  );
}

// Valid chroma stays far below 1; culori's clamp never returns on Infinity,
// which an invalid seed reaches before validation reports it.
function inP3(lightness: number, chroma: number, hue: null | number): Color {
  const clamped = clampChroma(
    {
      c: Math.min(chroma, 1),
      h: hue ?? undefined,
      l: lightness,
      mode: 'oklch',
    },
    'oklch',
    'p3',
  );
  return { components: [clamped.l, clamped.c, hue], space: 'oklch' };
}

function lightnessOf(color: Color): number {
  return color.components[0];
}

function mean(values: readonly number[]): number {
  let sum = 0;
  for (const value of values) sum += value;
  return sum / values.length;
}

function nearestStep(lightness: number): CoreStep {
  let best: CoreStep = steps[0];
  for (const step of steps) {
    const distance = Math.abs(lightnessCurve[step] - lightness);
    if (distance < Math.abs(lightnessCurve[best] - lightness)) best = step;
  }
  return best;
}

function perStep<Value>(
  value: (step: CoreStep) => Value,
): Record<CoreStep, Value> {
  return {
    100: value(100),
    200: value(200),
    300: value(300),
    400: value(400),
    50: value(50),
    500: value(500),
    600: value(600),
    700: value(700),
    800: value(800),
    900: value(900),
    950: value(950),
  };
}
