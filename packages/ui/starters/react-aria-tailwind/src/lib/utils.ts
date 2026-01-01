import { composeRenderProps } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import { tv } from 'tailwind-variants';

/**
 * Focus ring preset for consistent focus styling across components.
 * Extends this in your component's tv() definition.
 */
export const focusRing = tv({
  base: 'outline outline-ring/70 outline-offset-2 forced-colors:outline-[Highlight]',
  variants: {
    isFocusVisible: {
      false: 'outline-0',
      true: 'outline-2',
    },
  },
});

/**
 * Composes render props with Tailwind classes.
 * Merges the provided Tailwind classes with any className from render props.
 */
export function composeTailwindRenderProps<T>(
  className: string | ((v: T) => string) | undefined,
  tw: string,
): string | ((v: T) => string) {
  return composeRenderProps(className, (className) => twMerge(tw, className));
}
