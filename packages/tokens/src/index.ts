import {
  mauve,
  mist,
  neutral,
  olive,
  stone,
  taupe,
  zinc,
} from '#/families/base-colors';
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
  DistinctPair,
  Intent,
  IntentRole,
  IntentRoleKind,
  LayeredSurface,
  NeutralRole,
  Role,
} from '#/roles';
export {
  allRoles,
  contrastMinimum,
  contrastPairs,
  derivedRoles,
  distinctMinimum,
  distinctPairs,
  intentRoleKinds,
  intents,
  layeredSurfaces,
  neutralRoles,
  stateLayer,
} from '#/roles';

export type { Scale, Step } from '#/scale';
export { steps } from '#/scale';
export type { Style, StyleColor, StyleToken, ThemeNamespace } from '#/style';
export type { FontRole, TextStyle, Typography } from '#/typography';
export { validateFamily } from '#/validate';
export { validateStyle, validateTypography } from '#/validate-axes';
export { zIndex } from '#/z-index';

export const families = {
  mauve,
  mist,
  neutral,
  olive,
  stone,
  taupe,
  zinc,
} as const;
export const styles = { vega } as const;
export const typographies = { default: defaultTypography } as const;

/**
 * Theme axes as DTCG Resolver modifiers: each is chosen on its own. Flavor and
 * each intent's hue are chosen within a family (see `Family`).
 */
export const axes = {
  family: { contexts: Object.keys(families), default: 'zinc' },
  style: { contexts: Object.keys(styles), default: 'vega' },
  typography: { contexts: Object.keys(typographies), default: 'default' },
} as const;
