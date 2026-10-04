import type { Color } from '#/color';
import type { Polarity } from '#/family';

import { contrastRatio, isOpaque, overlay } from '#/contrast';
import { contrastMinimum, type IntentRoleKind, stateLayer } from '#/roles';
import { type AuthoredScale, hasStep, orderedSteps, type Step } from '#/scale';

export type IntentSteps = Readonly<Record<IntentRoleKind, Step>>;

type AnyScale = AuthoredScale<string, string>;

type Foreground = { end: 50 | 950; ratio: number };

// Fixed by mode; their pairs are decorative or checked through `text`.
const subtleStep = { dark: 950, light: 50 } as const;
const borderStep = { dark: 800, light: 200 } as const;
// Accent text starts here and moves away from the page until it passes.
const textStart = { dark: 400, light: 600 } as const;

/**
Picks each intent role's step for one scale on one page (note 0004). The
fill is the nearest step to the anchor whose text passes 4.5:1 and which
passes 3:1 against the page; ties go to the side with more page contrast.
Text on the fill is whichever end of the scale contrasts more.
*/
export function pickIntentSteps(
  scale: AnyScale,
  polarity: Polarity,
  page: Color,
): IntentSteps | string {
  const present = orderedSteps.filter((step) => hasStep(scale.steps, step));
  const problem = inputProblem(scale, present, polarity, page);
  if (problem !== undefined) return problem;
  const fill = pickFill(scale, present, polarity, page);
  if (fill === undefined) return 'no step passes as a fill';
  const { end: foreground } = foregroundOf(scale, fill);
  const hover = pickHover(scale, present, fill, foreground);
  if (hover === undefined) return 'no step next to the fill passes as a hover';
  const subtle = subtleStep[polarity];
  const text = pickText(scale, present, polarity, page);
  if (text === undefined) return 'no step passes as text';
  return {
    border: borderStep[polarity],
    fill,
    foreground,
    hover,
    subtle,
    text,
  };
}

function foregroundOf(scale: AnyScale, fill: Step): Foreground {
  const light = contrastRatio(stepColor(scale, fill), stepColor(scale, 50));
  const dark = contrastRatio(stepColor(scale, fill), stepColor(scale, 950));
  return light >= dark ? { end: 50, ratio: light } : { end: 950, ratio: dark };
}

// Contrast is undefined for translucent colors, and a missing start step
// would make the searches start from index -1.
function inputProblem(
  scale: AnyScale,
  present: readonly Step[],
  polarity: Polarity,
  page: Color,
): string | undefined {
  if (!isOpaque(page)) return 'the page color is translucent';
  const translucent = present.find((step) => !isOpaque(stepColor(scale, step)));
  if (translucent !== undefined) return `step ${translucent} is translucent`;
  const needed = [
    scale.anchor[polarity],
    textStart[polarity],
    subtleStep[polarity],
    borderStep[polarity],
    50,
    950,
  ] as const;
  const missing = needed.find((step) => !present.includes(step));
  return missing === undefined ? undefined : `scale has no step ${missing}`;
}

function pickFill(
  scale: AnyScale,
  present: readonly Step[],
  polarity: Polarity,
  page: Color,
): Step | undefined {
  const anchor = present.indexOf(scale.anchor[polarity]);
  const towardPage = polarity === 'light' ? 1 : -1;
  const byDistance = present.toSorted((a, b) => {
    const distance =
      Math.abs(present.indexOf(a) - anchor) -
      Math.abs(present.indexOf(b) - anchor);
    return distance === 0
      ? (present.indexOf(b) - present.indexOf(a)) * towardPage
      : distance;
  });
  return byDistance.find(
    (step) =>
      foregroundOf(scale, step).ratio >= contrastMinimum.text &&
      contrastRatio(stepColor(scale, step), page) >=
        contrastMinimum['non-text'],
  );
}

// Moves away from the text color, so the text's contrast holds or rises. Not
// held to 3:1 against the page: in dark mode that neighbor is usually the step
// the fill rule rejected, and the other one fails the text.
function pickHover(
  scale: AnyScale,
  present: readonly Step[],
  fill: Step,
  foreground: 50 | 950,
): Step | undefined {
  const index = present.indexOf(fill);
  const away = foreground === 50 ? 1 : -1;
  return [present[index + away], present[index - away]].find(
    (step) =>
      step !== undefined &&
      contrastRatio(stepColor(scale, step), stepColor(scale, foreground)) >=
        contrastMinimum.text,
  );
}

function pickText(
  scale: AnyScale,
  present: readonly Step[],
  polarity: Polarity,
  page: Color,
): Step | undefined {
  const start = present.indexOf(textStart[polarity]);
  const candidates =
    polarity === 'light'
      ? present.slice(start)
      : present.slice(0, start + 1).toReversed();
  const subtle = stepColor(scale, subtleStep[polarity]);
  // Pressing tints the surface toward the text, so the text has to stay AA on
  // the pressed surface too.
  return candidates.find((step) => {
    const text = stepColor(scale, step);
    return [page, subtle].every(
      (surface) =>
        contrastRatio(text, surface) >= contrastMinimum.text &&
        contrastRatio(text, overlay(text, stateLayer.press, surface)) >=
          contrastMinimum.text,
    );
  });
}

function stepColor(scale: AnyScale, step: Step): Color {
  const color = scale.steps[step];
  if (color === undefined) throw new Error(`scale has no step ${step}`);
  return color;
}
