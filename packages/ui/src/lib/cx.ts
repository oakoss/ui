import { type ClassNameValue } from 'cn';
import { createCn } from 'cn/config';
import { composeRenderProps } from 'react-aria-components';

import { cnTheme } from '#/lib/cn-config';

type Render<T> = ((values: T) => string) | string | undefined;

// tailwind-variants/lite doesn't merge, so every tv result goes through cn or cx.
export const cn = createCn({ extend: { theme: cnTheme } });

export function cx<T = unknown>(
  base: ClassNameValue,
  className?: Render<T>,
): (values: T) => string {
  return composeRenderProps(className, (resolved) => cn(base, resolved));
}
