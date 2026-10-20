import { useLayoutEffect, useRef } from 'react';

// A ref to the latest render's value, for effects that shouldn't re-run when
// it changes: useTable, for one, returns a new table each render. It syncs
// in a layout effect, ahead of every passive effect.
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
