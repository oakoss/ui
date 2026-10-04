// DTCG's structured color. Lightness is 0–1; a `null` hue is CSS `none`.
export type Color = {
  alpha?: number;
  components: readonly [lightness: number, chroma: number, hue: null | number];
  space: 'oklch';
};

// Written as a positive range so NaN fails.
export function isUnitInterval(value: number): boolean {
  return value >= 0 && value <= 1;
}

export function isValidColor(color: Color): boolean {
  const [lightness, chroma, hue] = color.components;
  const isAlphaOk = color.alpha === undefined || isUnitInterval(color.alpha);
  const isHueOk = hue === null || (hue >= 0 && hue < 360);
  // Palette chroma stays far below 1; far larger values overflow conversion.
  const isChromaOk = chroma >= 0 && chroma <= 1;
  return isUnitInterval(lightness) && isChromaOk && isHueOk && isAlphaOk;
}

// Lightness is a percentage here, as Tailwind's `theme.css` writes it.
export function oklch(
  lightnessPercent: number,
  chroma: number,
  hue: null | number,
  alpha?: number,
): Color {
  const components = [lightnessPercent / 100, chroma, hue] as const;
  return alpha === undefined
    ? { components, space: 'oklch' }
    : { alpha, components, space: 'oklch' };
}
