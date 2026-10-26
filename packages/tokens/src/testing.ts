import type { Color } from '#/color';
import type { ColorRef, Family, Flavor } from '#/family';
import type { NeutralRole } from '#/roles';
import type { Scale } from '#/scale';

import { neutral } from '#/families/base-colors';

export const base: Family = neutral;

// Charts following the primary, as shadcn's themes ramp them.
export const primaryRamp: Family['charts'] = {
  kind: 'ramp',
  source: { intent: 'primary' },
  steps: [300, 500, 600, 700, 800],
};
export const light: Flavor<string, string> = neutral.flavors.light;
export const dark: Flavor<string, string> = neutral.flavors.dark;

// Types data that breaks T on purpose, as untyped input such as JSON can.
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the point of the helper
export function untyped<T>(value: unknown): T {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the point of the helper
  return value as T;
}

export function withFlavors(
  flavors: Record<string, Flavor<string, string>>,
): Family {
  return { ...base, flavors: { ...base.flavors, ...flavors } };
}

export function withLightRole(
  role: NeutralRole,
  ref: ColorRef<string, string>,
): Family {
  return withFlavors({
    light: { ...light, roles: { ...light.roles, [role]: ref } },
  });
}

export function withNeutral(name: string, color: Color): Family {
  const neutrals = { ...base.palette.neutrals, [name]: color };
  return { ...base, palette: { ...base.palette, neutrals } };
}

export function withScale(name: string, scale: Scale<string, string>): Family {
  const scales = { ...base.palette.scales, [name]: scale };
  return { ...base, palette: { ...base.palette, scales } };
}
