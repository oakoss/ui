import type { Color } from '#/color';
import type { ColorRef, Family, Flavor } from '#/family';
import type { NeutralRole } from '#/roles';
import type { Scale } from '#/scale';

import { neutral } from '#/families/base-colors';

export const base: Family = neutral;
export const light: Flavor<string, string> = neutral.flavors.light;
export const dark: Flavor<string, string> = neutral.flavors.dark;

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
