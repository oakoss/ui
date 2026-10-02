import type { Color } from '#/color';
import type { ColorRef } from '#/family';

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
  // The family's canonical step; the role-step rule tries it first for fills.
  anchor?: Step;
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
 * One published color the generator expands into a full scale. The seed sits
 * unchanged at the step nearest its lightness; `overrides` always win.
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

export function isStep(value: number): value is Step {
  return (orderedSteps as readonly number[]).includes(value);
}
