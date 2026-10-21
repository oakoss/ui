// A sandboxed or opaque origin throws on reading cookies, a server has none,
// and a malformed value can't be decoded; all read as absent.
export function readCookie(key: string) {
  try {
    const prefix = `${encodeURIComponent(key)}=`;
    const entry = document.cookie
      .split('; ')
      .find((part) => part.startsWith(prefix));
    return entry === undefined
      ? null
      : decodeURIComponent(entry.slice(prefix.length));
  } catch {
    return null;
  }
}

// Writes go through the Cookie Store API, which only secure pages have;
// without it, or if the write fails, the value lasts until the page reloads.
export async function writeCookie(key: string, value: string) {
  if (!('cookieStore' in globalThis)) return;
  try {
    await cookieStore.set({
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      name: encodeURIComponent(key),
      path: '/',
      sameSite: 'lax',
      value: encodeURIComponent(value),
    });
  } catch {
    // A blocked write keeps the value for this page only.
  }
}
