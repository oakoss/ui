import { Fragment, isValidElement, type ReactNode } from 'react';

// Whether a node renders nothing, fragments and arrays included, so a part
// for it can skip mounting. Other iterables count as content: reading one
// could use it up before it renders.
export function isEmptyNode(node: ReactNode): boolean {
  let current = node;
  while (
    isValidElement<{ children?: ReactNode }>(current) &&
    current.type === Fragment
  ) {
    current = current.props.children;
  }
  if (Array.isArray(current))
    return current.every((child) => isEmptyNode(child));
  return (
    current === undefined ||
    current === null ||
    typeof current === 'boolean' ||
    current === ''
  );
}
