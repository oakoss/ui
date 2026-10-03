import { type Color, isValidColor } from '#/color';
import {
  type AuthoredScale,
  hasStep,
  orderedSteps,
  type Scale,
  steps,
} from '#/scale';

export function scaleErrors(
  name: string,
  scale: Scale<string, string>,
): string[] {
  const errors: string[] = [];
  if (scale.kind === 'seeded') {
    const overrides = Object.values(scale.overrides ?? {});
    if ([scale.seed, ...overrides].some((color) => !isValidColor(color))) {
      errors.push(`scale "${name}" has an invalid color`);
    }
    return errors;
  }
  const missing = steps.filter((step) => !hasStep(scale.steps, step));
  if (missing.length > 0) {
    return [
      ...errors,
      `scale "${name}" is missing steps ${missing.join(', ')}`,
    ];
  }
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
    if (step === undefined)
      return [`scale "${name}" has no ${polarity} anchor`];
    return hasStep(scaleSteps, step)
      ? []
      : [`scale "${name}" ${polarity} anchor is missing step ${step}`];
  });
}
