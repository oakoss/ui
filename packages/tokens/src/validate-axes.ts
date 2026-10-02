import type { Style } from '#/style';

import { isUnitInterval } from '#/color';
import { fontRoles, type Typography } from '#/typography';

export function validateStyle(style: Style): string[] {
  const errors: string[] = [];
  for (const [name, token] of Object.entries(style.tokens)) {
    if (token.value.trim() === '') {
      errors.push(`style token "${name}" has no value`);
    }
  }
  for (const [name, modes] of Object.entries(style.colors)) {
    for (const color of [modes.light, modes.dark]) {
      if (color !== 'transparent' && !isUnitInterval(color.alpha)) {
        errors.push(
          `style color "${name}" alpha ${color.alpha} is outside 0–1`,
        );
      }
    }
  }
  return errors;
}

export function validateTypography(typography: Typography): string[] {
  const errors = fontRoles
    .filter((role) => typography.fonts[role].trim() === '')
    .map((role) => `font role "${role}" is empty`);
  for (const [name, style] of Object.entries(typography.scale)) {
    if (style.size.trim() === '' || style.lineHeight.trim() === '') {
      errors.push(`text style "${name}" needs a size and a line height`);
    }
  }
  return errors;
}
