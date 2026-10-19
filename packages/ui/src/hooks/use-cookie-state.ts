import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';

// A boolean kept in a cookie, or only in memory when key is false. The cookie
// is read during render, so a client's first render is right; a server renders
// the default, and hydration then switches to the cookie without a mismatch.
// After a change the state follows its own value. Writes go through the Cookie
// Store API, which only secure pages have; without it, or if the write fails,
// the value lasts until the page reloads.
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
      if (key !== false) void writeStored(key, isNext);
    },
    [key],
  );
  return useMemo(
    () => ({ setValue, value: local ?? stored ?? isDefault }),
    [isDefault, local, setValue, stored],
  );
}

// A sandboxed or opaque origin throws on reading cookies; the default applies.
function readStored(key: string) {
  let cookies = '';
  try {
    cookies = document.cookie;
  } catch {
    return null;
  }
  const prefix = `${encodeURIComponent(key)}=`;
  const entry = cookies.split('; ').find((part) => part.startsWith(prefix));
  const value = entry?.slice(prefix.length);
  if (value === 'true') return true;
  return value === 'false' ? false : null;
}

// The cookie changes only through this hook, which re-renders itself.
function subscribeNever() {
  return () => {
    // Nothing to unsubscribe.
  };
}

async function writeStored(key: string, isValue: boolean) {
  if (!('cookieStore' in globalThis)) return;
  try {
    await cookieStore.set({
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      name: encodeURIComponent(key),
      path: '/',
      sameSite: 'lax',
      value: String(isValue),
    });
  } catch {
    // A blocked write keeps the value for this page only.
  }
}
