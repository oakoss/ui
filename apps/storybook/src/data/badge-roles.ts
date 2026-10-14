import type { BadgeStyleProps } from '@oakoss/ui/components/ui/data/badge';

import { computedColor, tokenColor } from '#/color';

export const intents = [
  'neutral',
  'primary',
  'success',
  'warning',
  'destructive',
  'info',
] as const satisfies readonly BadgeStyleProps['intent'][];

export const variants = [
  'solid',
  'soft',
  'outline',
] as const satisfies readonly BadgeStyleProps['variant'][];

type Intent = (typeof intents)[number];

export function colorOf(role: string) {
  return tokenColor(`--color-${role}`);
}

// Neutral has no hover role: its fill fades instead.
export function hoverOf(intent: Intent) {
  return intent === 'neutral'
    ? computedColor(
        'color-mix(in oklab, var(--color-foreground) 90%, transparent)',
      )
    : colorOf(`${intent}-hover`);
}

// The colors a look should paint. Neutral uses page colors rather than intent
// roles.
export function rolesOf(intent: Intent, variant: (typeof variants)[number]) {
  const transparent = 'rgba(0, 0, 0, 0)';
  const role =
    intent === 'neutral'
      ? {
          bg: 'foreground',
          border: 'border',
          fg: 'background',
          subtle: 'secondary',
          text: 'foreground',
        }
      : {
          bg: intent,
          border: `${intent}-border`,
          fg: `${intent}-foreground`,
          subtle: `${intent}-subtle`,
          text: `${intent}-text`,
        };
  if (variant === 'solid') {
    return { bg: colorOf(role.bg), border: transparent, fg: colorOf(role.fg) };
  }
  if (variant === 'soft') {
    return {
      bg: colorOf(role.subtle),
      border: transparent,
      fg: colorOf(role.text),
    };
  }
  return {
    bg: transparent,
    border: colorOf(role.border),
    fg: colorOf(role.text),
  };
}

// Sets React Aria's state attributes, which hover: and pressed: match, and
// waits for the transition.
export async function setState(
  element: HTMLElement,
  state: 'hovered' | 'pressed' | 'resting',
) {
  delete element.dataset.hovered;
  delete element.dataset.pressed;
  if (state !== 'resting') element.toggleAttribute(`data-${state}`, true);
  await Promise.all(element.getAnimations().map((a) => a.finished));
}
