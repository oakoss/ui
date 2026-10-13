import type { Color } from '#/color';
import type { ColorRef, Polarity } from '#/family';

export const steps = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

// Optional steps beyond Tailwind's range.
export const extraSteps = [25, 1000] as const;

export const orderedSteps = [25, ...steps, 1000] as const;

export type AuthoredScale<
  Hue extends string = never,
  Neutral extends string = never,
> = {
  // Where the role-step rule starts looking for each mode's fill.
  readonly anchor: Readonly<Record<Polarity, Step>>;
  kind: 'authored';
  steps: Readonly<Partial<Record<ExtraStep, Color>>> &
    Readonly<Record<CoreStep, Color>>;
} & ScaleBase<Hue, Neutral>;

export type CoreStep = (typeof steps)[number];

export type ExtraStep = (typeof extraSteps)[number];

export type Scale<Hue extends string = never, Neutral extends string = never> =
  | AuthoredScale<Hue, Neutral>
  | SeededScale<Hue, Neutral>;

/**
One published color the generator expands into a full scale. The seed sits
unchanged at the step nearest its lightness; `overrides` always win.
*/
export type SeededScale<
  Hue extends string = never,
  Neutral extends string = never,
> = {
  kind: 'seeded';
  overrides?: Readonly<Partial<Record<Step, Color>>>;
  seed: Color;
} & ScaleBase<Hue, Neutral>;

export type Step = CoreStep | ExtraStep;

type ScaleBase<Hue extends string, Neutral extends string> = {
  // Hand-written text on the fill, such as dark text on yellow; wins over the generator's pick.
  foreground?: Color | ColorRef<Hue, Neutral>;
};

// `never` names fit any family's palette, since these scales reference nothing.
export function authored(
  anchor: AuthoredScale['anchor'],
  scaleSteps: AuthoredScale['steps'],
): AuthoredScale {
  return { anchor, kind: 'authored', steps: scaleSteps };
}

// A seeded scale expands to every core step, plus the extras it overrides.
export function hasScaleStep(
  scale: Scale<string, string>,
  step: unknown,
): step is Step {
  if (scale.kind === 'authored') return hasStep(scale.steps, step);
  const overrides: Partial<Record<Step, Color>> = scale.overrides ?? {};
  return (
    typeof step === 'number' &&
    ((steps as readonly number[]).includes(step) ||
      (isStep(step) &&
        Object.hasOwn(overrides, step) &&
        overrides[step] !== undefined))
  );
}

// Untyped data can inherit a key, use a string key or set a step to `undefined`.
export function hasStep(
  scaleSteps: AuthoredScale['steps'],
  step: unknown,
): step is Step {
  return (
    typeof step === 'number' &&
    isStep(step) &&
    Object.hasOwn(scaleSteps, step) &&
    scaleSteps[step] !== undefined
  );
}

export function isStep(value: number): value is Step {
  return (orderedSteps as readonly number[]).includes(value);
}
