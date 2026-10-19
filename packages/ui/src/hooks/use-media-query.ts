import { useCallback, useSyncExternalStore } from 'react';

// Whether a media query matches. The browser's answer is read during render,
// so a client's first render is already right; a server renders
// isServerMatch, and hydration switches to the browser's answer without a
// mismatch.
export function useMediaQuery(query: string, isServerMatch = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => matchMedia(query).matches,
    () => isServerMatch,
  );
}
