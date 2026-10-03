import { type ClassNameValue } from 'cn';
import { createCn } from 'cn/config';
import { composeRenderProps } from 'react-aria-components';

import { cnTheme } from '#/lib/cn-config';

// Narrower than cn's ClassValue, whose dictionary branch accepts an uncalled
// tv slot (a function) and drops its classes.
export type ClassInput =
  | ClassNameValue
  | readonly ClassInput[]
  | Record<string, boolean | null | undefined>;

type Render<T> = ((values: T) => string) | string | undefined;

// tailwind-variants/lite doesn't merge, so every tv result goes through cn or cx.
export const cn: (...inputs: ClassInput[]) => string = createCn({
  extend: { theme: cnTheme },
});

export function cx<T = unknown>(
  base: ClassInput,
  className?: Render<T>,
): (values: T) => string {
  return composeRenderProps(className, (resolved) => cn(base, resolved));
}
