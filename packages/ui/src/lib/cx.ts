import { composeRenderProps } from 'react-aria-components';
import { type ClassNameValue, twMerge } from 'tailwind-merge';

type Render<T> = ((values: T) => string) | string | undefined;

/**
 * Merge Tailwind classes and compose with React Aria's render-prop `className`.
 * `base` is the component's own classes (a string or array); `className` is the
 * consumer's override — a string, a render function, or undefined.
 */
export function cx<T = unknown>(
  base: ClassNameValue,
  className?: Render<T>,
): (values: T) => string {
  return composeRenderProps(className, (resolved) => twMerge(base, resolved));
}
