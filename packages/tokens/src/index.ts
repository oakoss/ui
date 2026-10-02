import { neutral } from '#/families/neutral';
import { vega } from '#/styles/vega';
import { defaultTypography } from '#/typographies/default';

export type { Color } from '#/color';
export type {
  ColorPath,
  ColorRef,
  Family,
  Flavor,
  Palette,
  Polarity,
} from '#/family';
export type { TokenMeta } from '#/meta';
export {
  chartRoleMeta,
  derivedRoleMeta,
  intentRoleMeta,
  neutralRoleMeta,
} from '#/meta';
export { type ResolvedFlavor, resolveFlavor } from '#/resolve';
export type {
  ContrastKind,
  ContrastPair,
  Intent,
  IntentRole,
  IntentRoleKind,
  NeutralRole,
  Role,
} from '#/roles';
export {
  allRoles,
  contrastMinimum,
  contrastPairs,
  derivedRoles,
  intentRoleKinds,
  intents,
  neutralRoles,
} from '#/roles';

export type { Scale, Step } from '#/scale';
export { steps } from '#/scale';
export type { Style, StyleColor, StyleToken, ThemeNamespace } from '#/style';
export type { FontRole, TextStyle, Typography } from '#/typography';
export { validateFamily } from '#/validate';
export { validateStyle, validateTypography } from '#/validate-axes';
export { zIndex } from '#/z-index';

export const families = { neutral } as const;
export const styles = { vega } as const;
export const typographies = { default: defaultTypography } as const;

/**
 * Theme axes as DTCG Resolver modifiers: each is chosen on its own. Flavor and
 * each intent's hue are chosen within a family (see `Family`).
 */
export const axes = {
  family: { contexts: Object.keys(families), default: 'neutral' },
  style: { contexts: Object.keys(styles), default: 'vega' },
  typography: { contexts: Object.keys(typographies), default: 'default' },
} as const;
