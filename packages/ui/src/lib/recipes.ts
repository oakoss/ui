// An outline, not a ring-* box-shadow: forced-colors mode removes box-shadows
// but repaints outlines in a system color. `ring` passes 3:1 on every surface.
export const focusRing =
  'outline-hidden focus-visible:outline-(length:--ring-width) focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid';

// Text inputs show the ring on any focus, not only keyboard focus.
export const inputFocusRing =
  'outline-hidden focus:outline-(length:--ring-width) focus:outline-offset-2 focus:outline-ring focus:outline-solid';

// A gradient, so it paints over the fill. 8% and 12% are the tokens'
// stateLayer strengths, the ones intent text stays AA under. React Aria marks
// presses with data-pressed; plain elements fall back to :active.
export const stateLayer =
  'bg-linear-to-b from-transparent to-transparent hover:from-current/8 hover:to-current/8 pressed:from-current/12 pressed:to-current/12 not-data-rac:active:from-current/12 not-data-rac:active:to-current/12';

// Grows the hit area to at least 44×44 (WCAG 2.5.5) without changing the
// visible size. Components let callers turn it off for tightly packed groups.
export const targetSize =
  'relative after:absolute after:top-1/2 after:left-1/2 after:size-full after:min-h-11 after:min-w-11 after:-translate-1/2';
