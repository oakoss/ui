import type { Family, Palette } from '#/family';
import type { Intent } from '#/roles';
import type { Scale } from '#/scale';

// Untyped data can leave an intent out, set it to `undefined` or name an
// inherited key.
export function declaredIntent(
  family: Family,
  intent: string,
): Family['intents'][Intent] | undefined {
  const declared: Partial<Record<string, Family['intents'][Intent]>> =
    family.intents;
  return Object.hasOwn(declared, intent) ? declared[intent] : undefined;
}

// Untyped data can set a scale to `undefined`.
export function hasScale(
  palette: Palette<string, string>,
  name: string,
): boolean {
  const scales: Partial<Record<string, Scale<string, string>>> = palette.scales;
  return Object.hasOwn(scales, name) && scales[name] !== undefined;
}
