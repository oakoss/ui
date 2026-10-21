import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';

import { readCookie, writeCookie } from '#/lib/cookies';

// A boolean kept in a cookie, or only in memory when key is false. The cookie
// is read during render, so a client's first render is right; a server renders
// the default, and hydration then switches to the cookie without a mismatch.
// After a change the state follows its own value.
export function useCookieState(key: false | string, isDefault: boolean) {
  const [local, setLocal] = useState<boolean | null>(null);
  const stored = useSyncExternalStore(
    subscribeNever,
    () => (key === false ? null : readStored(key)),
    () => null,
  );
  const setValue = useCallback(
    (isNext: boolean) => {
      setLocal(isNext);
      if (key !== false) void writeCookie(key, String(isNext));
    },
    [key],
  );
  return useMemo(
    () => ({ setValue, value: local ?? stored ?? isDefault }),
    [isDefault, local, setValue, stored],
  );
}

function readStored(key: string) {
  const value = readCookie(key);
  if (value === 'true') return true;
  return value === 'false' ? false : null;
}

// The cookie changes only through this hook, which re-renders itself.
function subscribeNever() {
  return () => {
    // Nothing to unsubscribe.
  };
}
