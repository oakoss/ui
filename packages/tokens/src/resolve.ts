import type { ColorRef, Family, Flavor, Palette, Polarity } from '#/family';
import type { NeutralRole } from '#/roles';

export type ResolvedFlavor = {
  palette: Palette<string, string>;
  polarity: Polarity;
  roles: Partial<Record<NeutralRole, ColorRef<string, string>>>;
};

// Base flavors merge first, so the requested flavor's values win.
export function resolveFlavor(
  family: Family,
  flavorId: string,
): ResolvedFlavor | string {
  const requested = family.flavors[flavorId];
  if (requested === undefined) return `flavor "${flavorId}" doesn't exist`;
  const chain: Flavor<string, string>[] = [];
  const seen = new Set<string>();
  let id: string | undefined = flavorId;
  while (id !== undefined) {
    if (seen.has(id)) {
      return `flavor "${flavorId}" extends itself through "${id}"`;
    }
    seen.add(id);
    const flavor: Flavor<string, string> | undefined = family.flavors[id];
    if (flavor === undefined) {
      return `flavor "${flavorId}" extends unknown flavor "${id}"`;
    }
    chain.unshift(flavor);
    id = flavor.extends;
  }

  const palette = {
    neutrals: { ...family.palette.neutrals },
    scales: { ...family.palette.scales },
  };
  const roles: ResolvedFlavor['roles'] = {};
  for (const flavor of chain) {
    Object.assign(palette.neutrals, defined(flavor.palette?.neutrals));
    Object.assign(palette.scales, defined(flavor.palette?.scales));
    Object.assign(roles, defined(flavor.roles));
  }
  return { palette, polarity: requested.polarity, roles };
}

// The types allow an explicit `undefined`; treat it as "not overridden".
function defined<Value>(
  record: Readonly<Partial<Record<string, Value>>> | undefined,
): Record<string, Value> {
  return Object.fromEntries(
    Object.entries(record ?? {}).filter(
      (entry): entry is [string, Value] => entry[1] !== undefined,
    ),
  );
}
