import { useState } from 'react';

// The first value seen with this key, kept while the key holds, so a value
// rebuilt on every render keeps its identity for the memos that use it.
export function useStableValue<T>(value: T, toKey: (value: T) => string): T {
  const key = toKey(value);
  const [stable, setStable] = useState({ key, value });
  if (stable.key !== key) setStable({ key, value });
  return stable.key === key ? stable.value : value;
}
