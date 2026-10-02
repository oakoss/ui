import type { ComponentProps } from 'react';

import { TypeTable } from 'fumadocs-ui/components/type-table';

import { ownProps } from '#/lib/props';

export function OwnPropsTable({
  type,
  ...props
}: ComponentProps<typeof TypeTable>) {
  const own = ownProps(type);
  if (Object.keys(own).length === 0) {
    return <p>This component adds no props of its own.</p>;
  }
  return <TypeTable type={own} {...props} />;
}
