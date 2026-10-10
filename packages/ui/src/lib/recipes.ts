export const focusRing =
  'outline-hidden focus-visible:outline-(length:--ring-width) focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid';

export const inputFocusRing =
  'outline-hidden focus:outline-(length:--ring-width) focus:outline-offset-2 focus:outline-ring focus:outline-solid';

export const stateLayer =
  'bg-linear-to-b from-transparent to-transparent hover:from-current/8 hover:to-current/8 pressed:from-current/12 pressed:to-current/12 not-data-rac:active:from-current/12 not-data-rac:active:to-current/12';

// Joins a group's direct children along its data-orientation: shared edges
// overlap by 1px, inner corners go square, the focused child rises over its
// neighbors, and pressing doesn't shrink a child away from them.
export const joined =
  '*:focus-visible:z-10 *:pressed:scale-100 *:not-data-rac:active:scale-100 orientation-horizontal:*:not-first:-ms-px orientation-horizontal:*:not-first:rounded-s-none orientation-horizontal:*:not-last:rounded-e-none orientation-vertical:*:not-first:-mt-px orientation-vertical:*:not-first:rounded-t-none orientation-vertical:*:not-last:rounded-b-none';

export const targetSize =
  'relative after:absolute after:top-1/2 after:left-1/2 after:size-full after:min-h-11 after:min-w-11 after:-translate-1/2';
