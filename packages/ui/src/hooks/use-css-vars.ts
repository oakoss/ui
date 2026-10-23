import { type RefObject, useLayoutEffect } from 'react';

// Sets custom properties on an element, since the repo's lint forbids
// dynamic style objects; an undefined value removes the property.
export function useCssVars(
  ref: RefObject<HTMLElement | null>,
  vars: Readonly<Record<`--${string}`, string | undefined>>,
) {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    for (const [name, value] of Object.entries(vars)) {
      if (value === undefined) element.style.removeProperty(name);
      else element.style.setProperty(name, value);
    }
  });
}
