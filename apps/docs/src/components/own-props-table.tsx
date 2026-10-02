import type { ComponentProps } from 'react';

import { TypeTable } from 'fumadocs-ui/components/type-table';

import { INHERITED_PREFIX } from '#/lib/props';

export function OwnPropsTable({
  type,
  ...props
}: ComponentProps<typeof TypeTable>) {
  const own = Object.fromEntries(
    Object.entries(type).filter(([name]) => !name.startsWith(INHERITED_PREFIX)),
  );
  if (Object.keys(own).length === 0) {
    return <p>This component adds no props of its own.</p>;
  }
  return <TypeTable type={own} {...props} />;
}
