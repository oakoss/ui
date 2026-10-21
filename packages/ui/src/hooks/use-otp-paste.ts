import type { InputProps } from 'react-aria-components';

import { type ClipboardEvent, type FocusEvent, useRef } from 'react';

// input-otp sets a pasted code from script, ignoring readOnly and firing no
// change event. A browser fires change when a field it edited loses focus,
// which React Aria's native validation waits for, so a paste that changed
// the code does the same; a rejected or empty-handed paste commits nothing.
export function useOTPPaste(
  { onBlur, onPaste, readOnly }: InputProps,
  value: string,
) {
  const isEditedRef = useRef(false);
  return {
    guard: (event: ClipboardEvent) => {
      if (readOnly !== true) return;
      event.preventDefault();
      event.stopPropagation();
    },
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      onBlur?.(event);
      if (!isEditedRef.current) return;
      isEditedRef.current = false;
      const input = event.currentTarget;
      queueMicrotask(() => {
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    },
    onPaste: (event: ClipboardEvent<HTMLInputElement>) => {
      onPaste?.(event);
      if (event.currentTarget.value !== value) isEditedRef.current = true;
    },
  };
}
