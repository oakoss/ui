import { type Color, isValidColor } from '#/color';
import {
  type AuthoredScale,
  hasStep,
  orderedSteps,
  type Scale,
  type SeededScale,
  steps,
} from '#/scale';
import { expandSeeded } from '#/seeded';

export function scaleErrors(
  name: string,
  scale: Scale<string, string>,
): string[] {
  if (scale.kind === 'seeded') return seededErrors(name, scale);
  // Untyped data can carry any kind.
  const kind: string = scale.kind;
  if (kind !== 'authored') {
    return [`scale "${name}" has unknown kind "${kind}"`];
  }
  const missing = steps.filter((step) => !hasStep(scale.steps, step));
  if (missing.length > 0) {
    return [`scale "${name}" is missing steps ${missing.join(', ')}`];
  }
  const errors: string[] = [];
  const present: Color[] = orderedSteps.flatMap((step) => {
    const color: Color | undefined = scale.steps[step];
    return color === undefined ? [] : [color];
  });
  if (present.some((color) => !isValidColor(color))) {
    errors.push(`scale "${name}" has an invalid color`);
  }
  const lightness = present.map((color) => color.components[0]);
  if (
    lightness.some(
      (value, index) => index > 0 && value >= (lightness[index - 1] ?? 1),
    )
  ) {
    errors.push(`scale "${name}" doesn't get darker at every step`);
  }
  return [...errors, ...anchorErrors(name, scale.anchor, scale.steps)];
}

// Typed as optional because untyped data can leave the anchor out.
function anchorErrors(
  name: string,
  anchor: Partial<AuthoredScale['anchor']> | undefined,
  scaleSteps: AuthoredScale['steps'],
): string[] {
  return (['dark', 'light'] as const).flatMap((polarity) => {
    const step = anchor?.[polarity];
    if (step === undefined) return `scale "${name}" has no ${polarity} anchor`;
    return hasStep(scaleSteps, step)
      ? []
      : `scale "${name}" ${polarity} anchor is missing step ${step}`;
  });
}

// Overrides can break the expanded scale's order, so once its colors are
// valid it gets the authored checks.
function seededErrors(
  name: string,
  scale: SeededScale<string, string>,
): string[] {
  // The types allow an explicit `undefined`, which means "not overridden".
  const overrides = Object.values(scale.overrides ?? {}).filter(
    (color: Color | undefined) => color !== undefined,
  );
  if ([scale.seed, ...overrides].some((color) => !isValidColor(color))) {
    return [`scale "${name}" has an invalid color`];
  }
  const [, chroma, hue] = scale.seed.components;
  if (hue === null && chroma > 0) {
    return [`scale "${name}" seed has chroma but no hue`];
  }
  return scaleErrors(name, expandSeeded(scale));
}
