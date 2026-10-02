import type { Color } from '#/color';
import type { Intent, NeutralRole } from '#/roles';
import type { Scale, Step } from '#/scale';

export type Charts<Hue extends string> =
  | { hues: readonly [Hue, Hue, Hue, Hue, Hue]; kind: 'categorical' }
  | {
      kind: 'ramp';
      source: { hue: Hue; intent?: never } | { hue?: never; intent: Intent };
      steps: FiveSteps;
    };

export type ColorPath<Hue extends string, Neutral extends string> =
  | `color.${Hue}.${Step}`
  | `color.${Neutral}`;

export type ColorRef<Hue extends string, Neutral extends string> = {
  alpha?: number;
  ref: ColorPath<Hue, Neutral>;
};

/**
 * Write families with `defineFamily`: an annotation, `satisfies Family` or a
 * `Record<string, …>` annotation on `palette.scales` widens the names to
 * `string` and drops the reference checks. `NoInfer` makes `palette` the only
 * source of hue and neutral names.
 */
export type Family<
  Hue extends string = string,
  Neutral extends string = string,
  FlavorId extends string = string,
> = {
  charts: Charts<NoInfer<Hue>>;
  defaults: { dark: NoInfer<FlavorId>; light?: NoInfer<FlavorId> };
  flavors: Readonly<
    Record<FlavorId, Flavor<NoInfer<Hue>, NoInfer<Neutral>, NoInfer<FlavorId>>>
  >;
  id: string;
  intents: Readonly<Record<Intent, IntentChoice<NoInfer<Hue>>>>;
  name: string;
  palette: Palette<Hue, Neutral>;
};

export type Flavor<
  Hue extends string,
  Neutral extends string,
  FlavorId extends string = string,
> = {
  extends?: FlavorId;
  name: string;
  palette?: {
    neutrals?: Readonly<Partial<Record<Neutral, Color>>>;
    // A scale listed here replaces the base scale whole.
    scales?: Readonly<Partial<Record<Hue, Scale<Hue, Neutral>>>>;
  };
  polarity: Polarity;
  roles: Readonly<Partial<Record<NeutralRole, ColorRef<Hue, Neutral>>>>;
};

export type IntentChoice<Hue extends string> = {
  choices: readonly Hue[];
  default: Hue;
};

export type Palette<Hue extends string, Neutral extends string> = {
  neutrals: Readonly<Record<Neutral, Color>>;
  scales: Readonly<Record<Hue, Scale<NoInfer<Hue>, NoInfer<Neutral>>>>;
};

export type Polarity = 'dark' | 'light';

type FiveSteps = readonly [Step, Step, Step, Step, Step];

export function defineFamily<
  const Hue extends string,
  const Neutral extends string,
  const FlavorId extends string,
>(family: Family<Hue, Neutral, FlavorId>): Family<Hue, Neutral, FlavorId> {
  return family;
}
