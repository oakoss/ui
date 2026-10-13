import type { ReactNode } from 'react';

// A collection item's text for typeahead and filtering: its textValue, or its
// label when that's plain text. A blank one counts as none, since React Aria
// skips an item whose text is empty.
export function itemTextValue(
  textValue: string | undefined,
  children: ReactNode,
): string | undefined {
  if ((textValue ?? '').trim() !== '') return textValue;
  const text = plainText(children);
  return (text ?? '').trim() === '' ? undefined : text;
}

// JSX like `Delete {count} files` passes its text as an array.
function plainText(children: ReactNode): string | undefined {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (!Array.isArray(children)) return undefined;
  const parts = children.map((child: ReactNode) => plainText(child));
  return parts.every((part) => part !== undefined) ? parts.join('') : undefined;
}
