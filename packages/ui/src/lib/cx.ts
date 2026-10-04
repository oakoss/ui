import { type ClassNameValue } from 'cn';
import { createCn } from 'cn/config';
import { composeRenderProps } from 'react-aria-components';

import { cnTheme } from '#/lib/cn-config';

export type ClassInput =
  | ClassNameValue
  | readonly ClassInput[]
  | Record<string, boolean | null | undefined>;

type Render<T> = ((values: T) => string) | string | undefined;

export const cn: (...inputs: ClassInput[]) => string = createCn({
  extend: { theme: cnTheme },
});

export function cx<T = unknown>(
  base: ClassInput,
  className?: Render<T>,
): (values: T) => string {
  return composeRenderProps(className, (resolved) => cn(base, resolved));
}
