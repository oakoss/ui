import type { ComponentProps } from 'react';

import { TypeTable } from 'fumadocs-ui/components/type-table';

import { NO_OWN_PROPS } from '#/lib/props';

export function OwnPropsTable(props: ComponentProps<typeof TypeTable>) {
  if (Object.keys(props.type).length === 0) return <p>{NO_OWN_PROPS}</p>;
  return <TypeTable {...props} />;
}
